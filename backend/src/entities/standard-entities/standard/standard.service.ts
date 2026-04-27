import { Injectable } from "@nestjs/common";
import { MATERIAL_TYPES, REPORT_TYPES, UNIT_STATUSES } from "src/constants";
import { ReportRepository } from "src/entities/report-entities/report/report.repository";
import { Report } from "src/entities/report-entities/report/report.model";
import { UnitHierarchyService } from "src/entities/unit-entities/features/unit-hierarchy/unit-hierarchy.service";
import {
    ChildStandard,
    CalculatedUnitStandard,
    MaterialsGroups,
    RelevantStandard,
    StandardMaterialCategory,
    StandardOrigin,
    StandardResponse,
} from "./standard.types";
import { StandardRepository } from "./standard.repository";
import { CategoryDesc } from "../category-desc/category-desc.model";
import { MaterialDto, UnitDto, UnitStatusDto } from "src/entities/report-entities/report/report.types";

const toNum = (v: string | number | null | undefined): number => {
    const n = Number(v ?? 0);
    return Number.isNaN(n) ? 0 : n;
};

const ELIGIBLE_STATUSES = new Set([UNIT_STATUSES.WAITING_FOR_ALLOCATION, UNIT_STATUSES.ALLOCATING]);

type LiveMaterialData = {
    stockQuan: number;
    requisitionQuan: number;
};

type UnitInfo = {
    description: string;
    level: number;
    simul: string;
};

const DEFAULT_UNIT_STATUS: UnitStatusDto = {
    id: 0,
    description: "",
};

@Injectable()
export class StandardService {
    constructor(
        private readonly standardRepository: StandardRepository,
        private readonly reportRepository: ReportRepository,
        private readonly unitHierarchyService: UnitHierarchyService,
    ) { }

    async getRelevantToolMaterialIds(screenUnitId: number, date: string): Promise<string[]> {
        const activeRelations = await this.unitHierarchyService.fetchActiveRelations(date);
        const parentByChild = new Map<number, number>();
        for (const rel of activeRelations) parentByChild.set(rel.relatedUnitId, rel.unitId);

        const ancestors = this.buildAncestorChain(screenUnitId, parentByChild);
        const ancestorIds = new Set([screenUnitId, ...ancestors]);
        const allAncestorIds = [screenUnitId, ...ancestors];

        const allGroupIds = await this.standardRepository.getAllItemGroupIds();
        const allStandards = await this.standardRepository.getStandardsForItemGroups(allGroupIds);
        const ancestorManagedStandards = allStandards.filter(s => ancestorIds.has(s.managingUnit));

        const unitTagsByUnit = await this.standardRepository.getUnitStandardTags(allAncestorIds);
        const relevantStandards = this.filterRelevantStandards(ancestorManagedStandards, allAncestorIds, unitTagsByUnit);

        const groupToMaterialMap = await this.standardRepository.getAllGroupToMaterialMappings();
        const toolIds = new Set<string>();
        for (const standard of relevantStandards) {
            if (standard.toolGroupId) {
                toolIds.add(standard.toolGroupId);
                for (const id of (groupToMaterialMap.get(standard.toolGroupId) ?? [])) toolIds.add(id);
            }
        }
        return Array.from(toolIds);
    }

    async getStandardDrawerData(screenUnitId: number, date: string): Promise<StandardResponse> {
        const activeRelations = await this.unitHierarchyService.fetchActiveRelations(date);
        const parentByChild = new Map<number, number>();
        const childrenByParent = new Map<number, number[]>();
        for (const rel of activeRelations) {
            parentByChild.set(rel.relatedUnitId, rel.unitId);
            const children = childrenByParent.get(rel.unitId) ?? [];
            children.push(rel.relatedUnitId);
            childrenByParent.set(rel.unitId, children);
        }

        const ancestors = this.buildAncestorChain(screenUnitId, parentByChild);
        const ancestorIds = new Set([screenUnitId, ...ancestors]);
        const allAncestorIds = [screenUnitId, ...ancestors];

        const immediateChildren = childrenByParent.get(screenUnitId) ?? [];
        if (immediateChildren.length === 0) return { materialCategories: [] };

        const childStatusMap = await this.standardRepository.getUnitStatusesForDate(immediateChildren, date);
        const eligibleChildren = immediateChildren.filter(id => {
            const statusId = childStatusMap.get(id);
            return statusId !== undefined && ELIGIBLE_STATUSES.has(statusId);
        });

        if (eligibleChildren.length === 0) return { materialCategories: [] };

        const allDescendants = eligibleChildren.flatMap(id => [id, ...this.collectDescendants(id, childrenByParent)]);
        const allRelevantUnitIds = Array.from(new Set([screenUnitId, ...allDescendants]));

        const allUnitIdsForDetails = Array.from(new Set([...allRelevantUnitIds, ...allAncestorIds]));
        const unitDetails = await this.standardRepository.getUnitDetails(date, allUnitIdsForDetails);
        const unitDescriptions = new Map<number, UnitInfo>();
        for (const detail of unitDetails) {
            unitDescriptions.set(detail.unitId, {
                description: detail.description ?? "",
                level: detail.unitLevelId ?? 0,
                simul: detail.simul ?? "",
            });
        }

        const allUnitIdsForTags = Array.from(new Set([...allAncestorIds, ...allDescendants]));
        const unitTagsByUnit = await this.standardRepository.getUnitStandardTags(allUnitIdsForTags);

        const { groupToCategoryMap } = await this.standardRepository.getAllCategories();

        const reports = await this.reportRepository.fetchReportsDataForUnits(date, allRelevantUnitIds);
        const liveDataByUnit = this.buildLiveDataLookup(reports);

        const allGroupIds = await this.standardRepository.getAllItemGroupIds();
        const allStandards = await this.standardRepository.getStandardsForItemGroups(allGroupIds);

        const ancestorManagedStandards = allStandards.filter(s => ancestorIds.has(s.managingUnit));

        const relevantStandards = this.filterRelevantStandards(ancestorManagedStandards, allAncestorIds, unitTagsByUnit);

        const groupToMaterialMap = await this.standardRepository.getAllGroupToMaterialMappings();
        const allMaterials = await this.standardRepository.getAllMaterials();
        const allGroupNames = await this.standardRepository.getAllGroupNames();

        const allCalculatedStandards: CalculatedUnitStandard[] = [];
        for (const childId of eligibleChildren) {
            const childTagsByLevel = unitTagsByUnit.get(childId) ?? new Map();
            const childInfo = unitDescriptions.get(childId);
            const calculated = this.calculateStandardForUnit(
                childId,
                childInfo?.description ?? String(childId),
                childTagsByLevel,
                relevantStandards,
                liveDataByUnit,
                childrenByParent,
                unitDescriptions,
                unitTagsByUnit,
                groupToMaterialMap,
            );
            allCalculatedStandards.push(...calculated);
        }

        return this.buildResponse(allCalculatedStandards, groupToCategoryMap, unitDescriptions, allMaterials, allGroupNames, groupToMaterialMap, liveDataByUnit);
    }

    private calculateStandardForUnit(
        unitId: number,
        unitDescription: string,
        unitTagsByLevel: Map<number, string>,
        relevantStandards: RelevantStandard[],
        liveDataByUnit: Map<number, Map<string, LiveMaterialData>>,
        childrenByParent: Map<number, number[]>,
        unitDescriptions: Map<number, UnitInfo>,
        unitTagsAll: Map<number, Map<number, string>>,
        groupToMaterialMap: Map<string, string[]>,
    ): CalculatedUnitStandard[] {
        const results: CalculatedUnitStandard[] = [];
        const unitChildren = childrenByParent.get(unitId) ?? [];
        const unitLevel = unitDescriptions.get(unitId)?.level ?? 0;

        for (const standard of relevantStandards) {
            const { lowestLevel } = standard;

            const standardTagAtUnitLevel = standard.values.find(v => v.tagLevel === unitLevel)?.tag;
            if (standardTagAtUnitLevel !== undefined) {
                const unitTagAtUnitLevel = unitTagsByLevel.get(unitLevel);
                if (unitTagAtUnitLevel !== standardTagAtUnitLevel) continue;
            }

            if (unitLevel === lowestLevel) {
                const unitLiveData = liveDataByUnit.get(unitId) ?? new Map<string, LiveMaterialData>();

                const stockQuan = this.sumGroupQuantity(unitLiveData, standard.itemGroupId, groupToMaterialMap, 'stockQuan');

                const baseStandardQuan = standard.values
                    .filter(v => v.tagLevel === lowestLevel)
                    .reduce((sum, v) => sum + toNum(v.quantity), 0);

                let toolQuan: number | null = null;
                let finalStandardQuan = baseStandardQuan;

                if (standard.toolGroupId) {
                    toolQuan = this.sumGroupQuantity(unitLiveData, standard.toolGroupId, groupToMaterialMap, 'stockQuan');
                    finalStandardQuan = baseStandardQuan * toolQuan;
                }

                const origins = this.buildOrigins(standard, baseStandardQuan, toolQuan, groupToMaterialMap);

                results.push({
                    unitId,
                    unitDescription,
                    standardId: standard.standardId,
                    managingUnit: standard.managingUnit,
                    itemGroupId: standard.itemGroupId,
                    toolGroupId: standard.toolGroupId,
                    toolGroupName: standard.toolGroupName,
                    standardQuan: finalStandardQuan,
                    stockQuan,
                    toolQuan,
                    note: standard.values.find(v => v.note)?.note ?? null,
                    lowestLevel,
                    origins,
                });
            } else if (unitChildren.length > 0) {
                for (const childId of unitChildren) {
                    const childTagsByLevel = unitTagsAll.get(childId) ?? new Map();
                    const childInfo = unitDescriptions.get(childId);
                    const sub = this.calculateStandardForUnit(
                        childId,
                        childInfo?.description ?? String(childId),
                        childTagsByLevel,
                        [standard],
                        liveDataByUnit,
                        childrenByParent,
                        unitDescriptions,
                        unitTagsAll,
                        groupToMaterialMap,
                    );
                    results.push(...sub);
                }
            }
        }

        return results;
    }

    private filterRelevantStandards(
        standards: RelevantStandard[],
        ancestorUnitIds: number[],
        unitTagsByUnit: Map<number, Map<number, string>>,
    ): RelevantStandard[] {
        return standards.filter(standard => {
            for (const ancestorId of ancestorUnitIds) {
                const ancestorTags = unitTagsByUnit.get(ancestorId) ?? new Map();
                for (const sv of standard.values) {
                    const ancestorTagAtLevel = ancestorTags.get(sv.tagLevel);
                    if (ancestorTagAtLevel !== undefined && ancestorTagAtLevel !== sv.tag) {
                        return false;
                    }
                }
            }
            return true;
        });
    }

    private buildResponse(
        calculated: CalculatedUnitStandard[],
        groupToCategoryMap: Map<string, CategoryDesc>,
        unitDescriptions: Map<number, UnitInfo>,
        allMaterials: Map<string, string>,
        allGroupNames: Map<string, string>,
        groupToMaterialMap: Map<string, string[]>,
        liveDataByUnit: Map<number, Map<string, LiveMaterialData>>,
    ): StandardResponse {
        const grouped = new Map<string, {
            managingUnit: UnitDto;
            materialCategory: StandardMaterialCategory;
            byGroup: Map<string, CalculatedUnitStandard[]>;
        }>();

        for (const entry of calculated) {
            const category = groupToCategoryMap.get(entry.itemGroupId);
            if (!category) continue;

            const key = `${entry.managingUnit}:${category.id}`;

            if (!grouped.has(key)) {
                grouped.set(key, {
                    managingUnit: this.buildUnitDto(entry.managingUnit, unitDescriptions),
                    materialCategory: { id: category.id, description: category.description },
                    byGroup: new Map(),
                });
            }

            const group = grouped.get(key)!;
            const list = group.byGroup.get(entry.itemGroupId) ?? [];
            list.push(entry);
            group.byGroup.set(entry.itemGroupId, list);
        }

        const materialCategories: StandardResponse["materialCategories"] = [];

        for (const group of grouped.values()) {
            const materialsGroups: MaterialsGroups[] = [];

            for (const [groupId, entries] of group.byGroup) {
                const groupDescription = allGroupNames.get(groupId) ?? allMaterials.get(groupId) ?? groupId;
                const materialGroup = this.buildMaterialDto(groupId, groupDescription, group.materialCategory.description);
                const toolMaterialIds = Array.from(new Set(
                    entries.flatMap(entry => entry.toolGroupId ? (groupToMaterialMap.get(entry.toolGroupId) ?? []) : [])
                ));

                const unitMap = new Map<number, ChildStandard>();
                for (const e of entries) {
                    const requisitionQuantity = this.sumGroupQuantity(
                        liveDataByUnit.get(e.unitId) ?? new Map(),
                        groupId,
                        groupToMaterialMap,
                        'requisitionQuan'
                    );

                    if (!unitMap.has(e.unitId)) {
                        unitMap.set(e.unitId, {
                            unit: this.buildUnitDto(e.unitId, unitDescriptions),
                            standardQuantity: 0,
                            stockQuantity: e.stockQuan,
                            requisitionQuantity,
                            origins: [],
                        });
                    }
                    const child = unitMap.get(e.unitId)!;
                    child.standardQuantity += e.standardQuan;
                    child.stockQuantity = e.stockQuan;
                    child.requisitionQuantity = requisitionQuantity;
                    child.origins.push(...e.origins);
                }

                const childrenStandards = Array.from(unitMap.values());
                const totalStandardQuantity = childrenStandards.reduce((s, c) => s + c.standardQuantity, 0);
                const childrenStockQuantity = childrenStandards.reduce((s, c) => s + c.stockQuantity, 0);
                const childrenRequisitionQuantity = childrenStandards.reduce((s, c) => s + c.requisitionQuantity, 0);

                if (totalStandardQuantity >= 0) {
                    materialsGroups.push({
                        materialGroup,
                        materialIds: groupToMaterialMap.get(groupId) ?? [],
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
                    managingUnit: group.managingUnit,
                    materialCategory: group.materialCategory,
                    materialsGroups,
                });
            }
        }

        return { materialCategories };
    }

    private buildLiveDataLookup(reports: Report[]): Map<number, Map<string, LiveMaterialData>> {
        const result = new Map<number, Map<string, LiveMaterialData>>();

        for (const report of reports) {
            if (!result.has(report.unitId)) {
                result.set(report.unitId, new Map());
            }
            const unitData = result.get(report.unitId)!;

            for (const item of (report.items ?? [])) {
                if (!item.materialId) continue;
                const existing = unitData.get(item.materialId) ?? { stockQuan: 0, requisitionQuan: 0 };
                const qty = toNum(item.confirmedQuantity ?? item.reportedQuantity);

                if (report.reportTypeId === REPORT_TYPES.INVENTORY) {
                    existing.stockQuan += qty;
                } else if (report.reportTypeId === REPORT_TYPES.REQUEST) {
                    existing.requisitionQuan += qty;
                }
                unitData.set(item.materialId, existing);
            }
        }

        return result;
    }

    private sumGroupQuantity(
        unitLiveData: Map<string, LiveMaterialData>,
        groupId: string,
        groupToMaterialMap: Map<string, string[]>,
        field: keyof LiveMaterialData,
    ): number {
        const groupEntry = unitLiveData.get(groupId);
        const groupQuan = groupEntry ? toNum(groupEntry[field]) : 0;
        const individualQuan = (groupToMaterialMap.get(groupId) ?? [])
            .reduce((sum, matId) => sum + toNum(unitLiveData.get(matId)?.[field]), 0);
        return groupQuan + individualQuan;
    }

    private buildOrigins(
        standard: RelevantStandard,
        baseQuan: number,
        toolCount: number | null,
        groupToMaterialMap: Map<string, string[]>,
    ): StandardOrigin[] {
        const totalQuan = toolCount !== null ? baseQuan * toolCount : baseQuan;
        const toolMaterialIds = standard.toolGroupId
            ? (groupToMaterialMap.get(standard.toolGroupId) ?? [])
            : [];
        const toolGroups = standard.toolGroupId
            ? this.buildMaterialDto(standard.toolGroupId, standard.toolGroupName ?? standard.toolGroupId, "", MATERIAL_TYPES.TOOL)
            : null;

        return [{
            standardId: standard.standardId,
            toolGroups,
            toolMaterialIds,
            toolStockQuantity: toolCount,
            perToolStockQuantity: standard.toolGroupId ? baseQuan : null,
            tags: standard.values.map(v => ({ level: v.tagLevel, tag: v.tag })),
            quantity: totalQuan,
            note: standard.values.find(v => v.note)?.note ?? null,
        }];
    }

    private buildUnitDto(unitId: number, unitDescriptions: Map<number, UnitInfo>): UnitDto {
        const unit = unitDescriptions.get(unitId);
        return {
            id: unitId,
            description: unit?.description ?? String(unitId),
            level: unit?.level ?? 0,
            simul: unit?.simul ?? "",
            parent: null,
            status: DEFAULT_UNIT_STATUS,
        };
    }

    private buildMaterialDto(
        id: string,
        description: string,
        category: string,
        type = MATERIAL_TYPES.ITEM,
    ): MaterialDto {
        return {
            id,
            description,
            multiply: 1,
            nickname: "",
            category,
            unitOfMeasure: "יח",
            type,
        };
    }

    private buildAncestorChain(unitId: number, parentByChild: Map<number, number>): number[] {
        const ancestors: number[] = [];
        let current = parentByChild.get(unitId);
        while (current !== undefined) {
            ancestors.push(current);
            current = parentByChild.get(current);
        }
        return ancestors;
    }

    private collectDescendants(rootId: number, childrenByParent: Map<number, number[]>): number[] {
        const result: number[] = [];
        const queue = [...(childrenByParent.get(rootId) ?? [])];
        while (queue.length > 0) {
            const id = queue.shift()!;
            result.push(id);
            queue.push(...(childrenByParent.get(id) ?? []));
        }
        return result;
    }

}
