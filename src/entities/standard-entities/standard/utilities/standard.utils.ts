import { MATERIAL_TYPES, REPORT_TYPES, UNIT_STATUSES } from "src/constants";
import { MaterialDto, UnitDto, UnitStatusDto } from "src/entities/report-entities/report/report.types";
import { Report } from "src/entities/report-entities/report/report.model";
import {
    CalculatedUnitStandard,
    ChildStandard,
    MaterialsGroups,
    RelevantStandard,
    StandardMaterialCategory,
    StandardOrigin,
    StandardResponse,
} from "../standard.types";
import { CategoryDesc } from "../../category-desc/category-desc.model";

export type LiveMaterialData = {
    stockQuantity: number;
    requisitionQuantity: number;
};

export type UnitInfo = {
    description: string;
    level: number;
    simul: string;
};

type ActiveUnitRelation = {
    unitId: number;
    relatedUnitId: number;
};

const DEFAULT_UNIT_STATUS: UnitStatusDto = {
    id: 0,
    description: "",
};

const ELIGIBLE_STANDARD_STATUSES = new Set([UNIT_STATUSES.WAITING_FOR_ALLOCATION, UNIT_STATUSES.ALLOCATING]);

export const parseQuantityValue = (value: string | number | null | undefined): number => {
    const parsedNumber = Number(value ?? 0);
    return Number.isNaN(parsedNumber) ? 0 : parsedNumber;
};

export const buildHierarchyLookups = (relations: ActiveUnitRelation[]) => {
    const parentUnitIdByChildUnitId = new Map<number, number>();
    const childUnitIdsByParentUnitId = new Map<number, number[]>();

    for (const relation of relations) {
        parentUnitIdByChildUnitId.set(relation.relatedUnitId, relation.unitId);
        const children = childUnitIdsByParentUnitId.get(relation.unitId) ?? [];
        children.push(relation.relatedUnitId);
        childUnitIdsByParentUnitId.set(relation.unitId, children);
    }

    return {
        parentUnitIdByChildUnitId,
        childUnitIdsByParentUnitId,
    };
};

export const getAncestorUnitIds = (unitId: number, parentUnitIdByChildUnitId: Map<number, number>): number[] => {
    const ancestors: number[] = [];
    let currentUnitId = parentUnitIdByChildUnitId.get(unitId);

    while (currentUnitId !== undefined) {
        ancestors.push(currentUnitId);
        currentUnitId = parentUnitIdByChildUnitId.get(currentUnitId);
    }

    return ancestors;
};

export const getDescendantUnitIds = (rootUnitId: number, childUnitIdsByParentUnitId: Map<number, number[]>): number[] => {
    const descendants: number[] = [];
    const queue = [...(childUnitIdsByParentUnitId.get(rootUnitId) ?? [])];

    while (queue.length > 0) {
        const unitId = queue.shift()!;
        descendants.push(unitId);
        queue.push(...(childUnitIdsByParentUnitId.get(unitId) ?? []));
    }

    return descendants;
};

export const getEligibleStandardChildUnitIds = (
    childUnitIds: number[],
    unitStatusByUnitId: Map<number, number>,
): number[] => childUnitIds.filter(unitId => {
    const statusId = unitStatusByUnitId.get(unitId);
    return statusId !== undefined && ELIGIBLE_STANDARD_STATUSES.has(statusId);
});

export const buildUnitInfoByUnitId = (
    unitDetails: { unitId: number; description: string | null; unitLevelId: number | null; simul: string | null }[],
): Map<number, UnitInfo> => {
    const unitInfoByUnitId = new Map<number, UnitInfo>();

    for (const detail of unitDetails) {
        unitInfoByUnitId.set(detail.unitId, {
            description: detail.description ?? "",
            level: detail.unitLevelId ?? 0,
            simul: detail.simul ?? "",
        });
    }

    return unitInfoByUnitId;
};

export const filterStandardsByAncestorTags = (
    standards: RelevantStandard[],
    ancestorUnitIds: number[],
    unitTagsByUnit: Map<number, Map<number, string>>,
): RelevantStandard[] => standards.filter(standard => {
    for (const ancestorUnitId of ancestorUnitIds) {
        const ancestorTags = unitTagsByUnit.get(ancestorUnitId) ?? new Map();
        for (const standardValue of standard.values) {
            const ancestorTagAtLevel = ancestorTags.get(standardValue.tagLevel);
            if (ancestorTagAtLevel !== undefined && ancestorTagAtLevel !== standardValue.tag) {
                return false;
            }
        }
    }

    return true;
});

export const calculateStandardsForUnit = (
    unitId: number,
    unitDescription: string,
    unitTagsByLevel: Map<number, string>,
    relevantStandards: RelevantStandard[],
    liveDataByUnit: Map<number, Map<string, LiveMaterialData>>,
    childUnitIdsByParentUnitId: Map<number, number[]>,
    unitInfoByUnitId: Map<number, UnitInfo>,
    unitTagsByUnit: Map<number, Map<number, string>>,
    groupToMaterialMap: Map<string, string[]>,
): CalculatedUnitStandard[] => {
    const results: CalculatedUnitStandard[] = [];
    const unitChildren = childUnitIdsByParentUnitId.get(unitId) ?? [];
    const unitLevel = unitInfoByUnitId.get(unitId)?.level ?? 0;

    for (const standard of relevantStandards) {
        const { lowestLevel } = standard;

        const standardTagAtUnitLevel = standard.values.find(standardValue => standardValue.tagLevel === unitLevel)?.tag;
        if (standardTagAtUnitLevel !== undefined) {
            const unitTagAtUnitLevel = unitTagsByLevel.get(unitLevel);
            if (unitTagAtUnitLevel !== standardTagAtUnitLevel) continue;
        }

        if (unitLevel === lowestLevel) {
            const unitLiveData = liveDataByUnit.get(unitId) ?? new Map<string, LiveMaterialData>();
            const stockQuantity = sumMaterialGroupQuantity(unitLiveData, standard.itemGroupId, groupToMaterialMap, "stockQuantity");
            const baseStandardQuantity = standard.values
                .reduce((total, standardValue) => total + parseQuantityValue(standardValue.quantity), 0);

            let toolQuantity: number | null = null;
            let finalStandardQuantity = baseStandardQuantity;

            if (standard.toolGroupId) {
                toolQuantity = sumMaterialGroupQuantity(unitLiveData, standard.toolGroupId, groupToMaterialMap, "stockQuantity");
                finalStandardQuantity = baseStandardQuantity * toolQuantity;
            }

            results.push({
                unitId,
                unitDescription,
                standardId: standard.standardId,
                managingUnit: standard.managingUnit,
                itemGroupId: standard.itemGroupId,
                toolGroupId: standard.toolGroupId,
                toolGroupName: standard.toolGroupName,
                standardQuantity: finalStandardQuantity,
                stockQuantity,
                toolQuantity,
                note: standard.values.find(standardValue => standardValue.note)?.note ?? null,
                lowestLevel,
                origins: buildStandardOriginDetails(standard, baseStandardQuantity, toolQuantity, groupToMaterialMap),
            });
        } else if (unitChildren.length > 0) {
            for (const childUnitId of unitChildren) {
                const childTagsByLevel = unitTagsByUnit.get(childUnitId) ?? new Map();
                const childInfo = unitInfoByUnitId.get(childUnitId);
                const childStandardResults = calculateStandardsForUnit(
                    childUnitId,
                    childInfo?.description ?? String(childUnitId),
                    childTagsByLevel,
                    [standard],
                    liveDataByUnit,
                    childUnitIdsByParentUnitId,
                    unitInfoByUnitId,
                    unitTagsByUnit,
                    groupToMaterialMap,
                );
                results.push(...childStandardResults);
            }
        }
    }

    return results;
};

export const buildStandardResponse = (
    calculatedStandards: CalculatedUnitStandard[],
    groupToCategoryMap: Map<string, CategoryDesc>,
    unitInfoByUnitId: Map<number, UnitInfo>,
    allMaterials: Map<string, string>,
    allGroupNames: Map<string, string>,
    groupToMaterialMap: Map<string, string[]>,
    liveDataByUnit: Map<number, Map<string, LiveMaterialData>>,
): StandardResponse => {
    const groupedStandards = new Map<string, {
        managingUnit: UnitDto;
        materialCategory: StandardMaterialCategory;
        standardsByMaterialGroup: Map<string, CalculatedUnitStandard[]>;
    }>();

    for (const calculatedStandard of calculatedStandards) {
        const category = groupToCategoryMap.get(calculatedStandard.itemGroupId);
        if (!category) continue;

        const groupKey = `${calculatedStandard.managingUnit}:${category.id}`;

        if (!groupedStandards.has(groupKey)) {
            groupedStandards.set(groupKey, {
                managingUnit: buildStandardUnitDto(calculatedStandard.managingUnit, unitInfoByUnitId),
                materialCategory: { id: category.id, description: category.description },
                standardsByMaterialGroup: new Map(),
            });
        }

        const group = groupedStandards.get(groupKey)!;
        const materialGroupStandards = group.standardsByMaterialGroup.get(calculatedStandard.itemGroupId) ?? [];
        materialGroupStandards.push(calculatedStandard);
        group.standardsByMaterialGroup.set(calculatedStandard.itemGroupId, materialGroupStandards);
    }

    const materialCategories: StandardResponse["materialCategories"] = [];

    for (const groupedStandard of groupedStandards.values()) {
        const materialsGroups: MaterialsGroups[] = [];

        for (const [materialGroupId, entries] of groupedStandard.standardsByMaterialGroup) {
            const materialGroupDescription = allGroupNames.get(materialGroupId) ?? allMaterials.get(materialGroupId) ?? materialGroupId;
            const materialGroup = buildStandardMaterialDto(materialGroupId, materialGroupDescription, groupedStandard.materialCategory.description);
            const toolMaterialIds = Array.from(new Set(
                entries.flatMap(entry => entry.toolGroupId ? (groupToMaterialMap.get(entry.toolGroupId) ?? []) : [])
            ));

            const childStandardByUnitId = new Map<number, ChildStandard>();
            for (const entry of entries) {
                const requisitionQuantity = sumMaterialGroupQuantity(
                    liveDataByUnit.get(entry.unitId) ?? new Map(),
                    materialGroupId,
                    groupToMaterialMap,
                    "requisitionQuantity"
                );

                if (!childStandardByUnitId.has(entry.unitId)) {
                    childStandardByUnitId.set(entry.unitId, {
                        unit: buildStandardUnitDto(entry.unitId, unitInfoByUnitId),
                        standardQuantity: 0,
                        stockQuantity: entry.stockQuantity,
                        requisitionQuantity,
                        origins: [],
                    });
                }

                const childStandard = childStandardByUnitId.get(entry.unitId)!;
                childStandard.standardQuantity += entry.standardQuantity;
                childStandard.stockQuantity = entry.stockQuantity;
                childStandard.requisitionQuantity = requisitionQuantity;
                childStandard.origins.push(...entry.origins);
            }

            const childrenStandards = Array.from(childStandardByUnitId.values());
            const totalStandardQuantity = childrenStandards.reduce((total, childStandard) => total + childStandard.standardQuantity, 0);
            const childrenStockQuantity = childrenStandards.reduce((total, childStandard) => total + childStandard.stockQuantity, 0);
            const childrenRequisitionQuantity = childrenStandards.reduce((total, childStandard) => total + childStandard.requisitionQuantity, 0);

            if (totalStandardQuantity >= 0) {
                materialsGroups.push({
                    materialGroup,
                    materialIds: groupToMaterialMap.get(materialGroupId) ?? [],
                    toolMaterialIds,
                    standards: [{
                        totalStandardQuantity,
                        childrenRequisitionQuantity,
                        childrenStockQuantity,
                        childrenStandards,
                    }],
                });
            }
        }

        if (materialsGroups.length > 0) {
            materialCategories.push({
                managingUnit: groupedStandard.managingUnit,
                materialCategory: groupedStandard.materialCategory,
                materialsGroups,
            });
        }
    }

    return { materialCategories };
};

export const buildLiveMaterialDataByUnitId = (reports: Report[]): Map<number, Map<string, LiveMaterialData>> => {
    const liveMaterialDataByUnitId = new Map<number, Map<string, LiveMaterialData>>();

    for (const report of reports) {
        if (!liveMaterialDataByUnitId.has(report.unitId)) {
            liveMaterialDataByUnitId.set(report.unitId, new Map());
        }
        const unitData = liveMaterialDataByUnitId.get(report.unitId)!;

        for (const item of (report.items ?? [])) {
            if (!item.materialId) continue;
            const existing = unitData.get(item.materialId) ?? { stockQuantity: 0, requisitionQuantity: 0 };
            const reportedQuantity = parseQuantityValue(item.confirmedQuantity ?? item.reportedQuantity);

            if (report.reportTypeId === REPORT_TYPES.INVENTORY) {
                existing.stockQuantity += reportedQuantity;
            } else if (report.reportTypeId === REPORT_TYPES.REQUEST) {
                existing.requisitionQuantity += reportedQuantity;
            }
            unitData.set(item.materialId, existing);
        }
    }

    return liveMaterialDataByUnitId;
};

export const sumMaterialGroupQuantity = (
    unitLiveData: Map<string, LiveMaterialData>,
    groupId: string,
    groupToMaterialMap: Map<string, string[]>,
    field: keyof LiveMaterialData,
): number => {
    const groupEntry = unitLiveData.get(groupId);
    const groupQuantity = groupEntry ? parseQuantityValue(groupEntry[field]) : 0;
    const individualMaterialQuantity = (groupToMaterialMap.get(groupId) ?? [])
        .reduce((total, materialId) => total + parseQuantityValue(unitLiveData.get(materialId)?.[field]), 0);
    return groupQuantity + individualMaterialQuantity;
};

export const buildStandardOriginDetails = (
    standard: RelevantStandard,
    baseQuantity: number,
    toolCount: number | null,
    groupToMaterialMap: Map<string, string[]>,
): StandardOrigin[] => {
    const totalQuantity = toolCount !== null ? baseQuantity * toolCount : baseQuantity;
    const toolMaterialIds = standard.toolGroupId
        ? (groupToMaterialMap.get(standard.toolGroupId) ?? [])
        : [];
    const toolGroups = standard.toolGroupId
        ? buildStandardMaterialDto(standard.toolGroupId, standard.toolGroupName ?? standard.toolGroupId, "", MATERIAL_TYPES.TOOL)
        : null;

    return [{
        standardId: standard.standardId,
        toolGroups,
        toolMaterialIds,
        toolStockQuantity: toolCount,
        perToolStockQuantity: standard.toolGroupId ? baseQuantity : null,
        tags: standard.values.map(standardValue => ({ level: standardValue.tagLevel, tag: standardValue.tag })),
        quantity: totalQuantity,
        note: standard.values.find(standardValue => standardValue.note)?.note ?? null,
    }];
};

export const buildStandardUnitDto = (unitId: number, unitInfoByUnitId: Map<number, UnitInfo>): UnitDto => {
    const unit = unitInfoByUnitId.get(unitId);
    return {
        id: unitId,
        description: unit?.description ?? String(unitId),
        level: unit?.level ?? 0,
        simul: unit?.simul ?? "",
        parent: null,
        status: DEFAULT_UNIT_STATUS,
    };
};

export const buildStandardMaterialDto = (
    id: string,
    description: string,
    category: string,
    type = MATERIAL_TYPES.ITEM,
): MaterialDto => ({
    id,
    description,
    multiply: 1,
    nickname: "",
    category,
    unitOfMeasure: "יח",
    type,
});
