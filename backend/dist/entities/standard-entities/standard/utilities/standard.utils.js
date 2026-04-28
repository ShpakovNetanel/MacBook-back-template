"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildStandardMaterialDto = exports.buildStandardUnitDto = exports.buildStandardOriginDetails = exports.sumMaterialGroupQuantity = exports.buildLiveMaterialDataByUnitId = exports.buildStandardResponse = exports.calculateStandardsForUnit = exports.filterStandardsByAncestorTags = exports.buildUnitInfoByUnitId = exports.getEligibleStandardChildUnitIds = exports.getDescendantUnitIds = exports.getAncestorUnitIds = exports.buildHierarchyLookups = exports.parseQuantityValue = void 0;
const constants_1 = require("../../../../constants");
const DEFAULT_UNIT_STATUS = {
    id: 0,
    description: "",
};
const ELIGIBLE_STANDARD_STATUSES = new Set([constants_1.UNIT_STATUSES.WAITING_FOR_ALLOCATION, constants_1.UNIT_STATUSES.ALLOCATING]);
const parseQuantityValue = (value) => {
    const parsedNumber = Number(value ?? 0);
    return Number.isNaN(parsedNumber) ? 0 : parsedNumber;
};
exports.parseQuantityValue = parseQuantityValue;
const buildHierarchyLookups = (relations) => {
    const parentUnitIdByChildUnitId = new Map();
    const childUnitIdsByParentUnitId = new Map();
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
exports.buildHierarchyLookups = buildHierarchyLookups;
const getAncestorUnitIds = (unitId, parentUnitIdByChildUnitId) => {
    const ancestors = [];
    let currentUnitId = parentUnitIdByChildUnitId.get(unitId);
    while (currentUnitId !== undefined) {
        ancestors.push(currentUnitId);
        currentUnitId = parentUnitIdByChildUnitId.get(currentUnitId);
    }
    return ancestors;
};
exports.getAncestorUnitIds = getAncestorUnitIds;
const getDescendantUnitIds = (rootUnitId, childUnitIdsByParentUnitId) => {
    const descendants = [];
    const queue = [...(childUnitIdsByParentUnitId.get(rootUnitId) ?? [])];
    while (queue.length > 0) {
        const unitId = queue.shift();
        descendants.push(unitId);
        queue.push(...(childUnitIdsByParentUnitId.get(unitId) ?? []));
    }
    return descendants;
};
exports.getDescendantUnitIds = getDescendantUnitIds;
const getEligibleStandardChildUnitIds = (childUnitIds, unitStatusByUnitId) => childUnitIds.filter(unitId => {
    const statusId = unitStatusByUnitId.get(unitId);
    return statusId !== undefined && ELIGIBLE_STANDARD_STATUSES.has(statusId);
});
exports.getEligibleStandardChildUnitIds = getEligibleStandardChildUnitIds;
const buildUnitInfoByUnitId = (unitDetails) => {
    const unitInfoByUnitId = new Map();
    for (const detail of unitDetails) {
        unitInfoByUnitId.set(detail.unitId, {
            description: detail.description ?? "",
            level: detail.unitLevelId ?? 0,
            simul: detail.simul ?? "",
        });
    }
    return unitInfoByUnitId;
};
exports.buildUnitInfoByUnitId = buildUnitInfoByUnitId;
const filterStandardsByAncestorTags = (standards, ancestorUnitIds, unitTagsByUnit) => standards.filter(standard => {
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
exports.filterStandardsByAncestorTags = filterStandardsByAncestorTags;
const calculateStandardsForUnit = (unitId, unitDescription, unitTagsByLevel, relevantStandards, liveDataByUnit, childUnitIdsByParentUnitId, unitInfoByUnitId, unitTagsByUnit, groupToMaterialMap) => {
    const results = [];
    const unitChildren = childUnitIdsByParentUnitId.get(unitId) ?? [];
    const unitLevel = unitInfoByUnitId.get(unitId)?.level ?? 0;
    for (const standard of relevantStandards) {
        const { lowestLevel } = standard;
        const standardTagAtUnitLevel = standard.values.find(standardValue => standardValue.tagLevel === unitLevel)?.tag;
        if (standardTagAtUnitLevel !== undefined) {
            const unitTagAtUnitLevel = unitTagsByLevel.get(unitLevel);
            if (unitTagAtUnitLevel !== standardTagAtUnitLevel)
                continue;
        }
        if (unitLevel === lowestLevel) {
            const unitLiveData = liveDataByUnit.get(unitId) ?? new Map();
            const stockQuantity = (0, exports.sumMaterialGroupQuantity)(unitLiveData, standard.itemGroupId, groupToMaterialMap, "stockQuantity");
            const baseStandardQuantity = standard.values
                .filter(standardValue => standardValue.tagLevel === lowestLevel)
                .reduce((total, standardValue) => total + (0, exports.parseQuantityValue)(standardValue.quantity), 0);
            let toolQuantity = null;
            let finalStandardQuantity = baseStandardQuantity;
            if (standard.toolGroupId) {
                toolQuantity = (0, exports.sumMaterialGroupQuantity)(unitLiveData, standard.toolGroupId, groupToMaterialMap, "stockQuantity");
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
                origins: (0, exports.buildStandardOriginDetails)(standard, baseStandardQuantity, toolQuantity, groupToMaterialMap),
            });
        }
        else if (unitChildren.length > 0) {
            for (const childUnitId of unitChildren) {
                const childTagsByLevel = unitTagsByUnit.get(childUnitId) ?? new Map();
                const childInfo = unitInfoByUnitId.get(childUnitId);
                const childStandardResults = (0, exports.calculateStandardsForUnit)(childUnitId, childInfo?.description ?? String(childUnitId), childTagsByLevel, [standard], liveDataByUnit, childUnitIdsByParentUnitId, unitInfoByUnitId, unitTagsByUnit, groupToMaterialMap);
                results.push(...childStandardResults);
            }
        }
    }
    return results;
};
exports.calculateStandardsForUnit = calculateStandardsForUnit;
const buildStandardResponse = (calculatedStandards, groupToCategoryMap, unitInfoByUnitId, allMaterials, allGroupNames, groupToMaterialMap, liveDataByUnit) => {
    const groupedStandards = new Map();
    for (const calculatedStandard of calculatedStandards) {
        const category = groupToCategoryMap.get(calculatedStandard.itemGroupId);
        if (!category)
            continue;
        const groupKey = `${calculatedStandard.managingUnit}:${category.id}`;
        if (!groupedStandards.has(groupKey)) {
            groupedStandards.set(groupKey, {
                managingUnit: (0, exports.buildStandardUnitDto)(calculatedStandard.managingUnit, unitInfoByUnitId),
                materialCategory: { id: category.id, description: category.description },
                standardsByMaterialGroup: new Map(),
            });
        }
        const group = groupedStandards.get(groupKey);
        const materialGroupStandards = group.standardsByMaterialGroup.get(calculatedStandard.itemGroupId) ?? [];
        materialGroupStandards.push(calculatedStandard);
        group.standardsByMaterialGroup.set(calculatedStandard.itemGroupId, materialGroupStandards);
    }
    const materialCategories = [];
    for (const groupedStandard of groupedStandards.values()) {
        const materialsGroups = [];
        for (const [materialGroupId, entries] of groupedStandard.standardsByMaterialGroup) {
            const materialGroupDescription = allGroupNames.get(materialGroupId) ?? allMaterials.get(materialGroupId) ?? materialGroupId;
            const materialGroup = (0, exports.buildStandardMaterialDto)(materialGroupId, materialGroupDescription, groupedStandard.materialCategory.description);
            const toolMaterialIds = Array.from(new Set(entries.flatMap(entry => entry.toolGroupId ? (groupToMaterialMap.get(entry.toolGroupId) ?? []) : [])));
            const childStandardByUnitId = new Map();
            for (const entry of entries) {
                const requisitionQuantity = (0, exports.sumMaterialGroupQuantity)(liveDataByUnit.get(entry.unitId) ?? new Map(), materialGroupId, groupToMaterialMap, "requisitionQuantity");
                if (!childStandardByUnitId.has(entry.unitId)) {
                    childStandardByUnitId.set(entry.unitId, {
                        unit: (0, exports.buildStandardUnitDto)(entry.unitId, unitInfoByUnitId),
                        standardQuantity: 0,
                        stockQuantity: entry.stockQuantity,
                        requisitionQuantity,
                        origins: [],
                    });
                }
                const childStandard = childStandardByUnitId.get(entry.unitId);
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
exports.buildStandardResponse = buildStandardResponse;
const buildLiveMaterialDataByUnitId = (reports) => {
    const liveMaterialDataByUnitId = new Map();
    for (const report of reports) {
        if (!liveMaterialDataByUnitId.has(report.unitId)) {
            liveMaterialDataByUnitId.set(report.unitId, new Map());
        }
        const unitData = liveMaterialDataByUnitId.get(report.unitId);
        for (const item of (report.items ?? [])) {
            if (!item.materialId)
                continue;
            const existing = unitData.get(item.materialId) ?? { stockQuantity: 0, requisitionQuantity: 0 };
            const reportedQuantity = (0, exports.parseQuantityValue)(item.confirmedQuantity ?? item.reportedQuantity);
            if (report.reportTypeId === constants_1.REPORT_TYPES.INVENTORY) {
                existing.stockQuantity += reportedQuantity;
            }
            else if (report.reportTypeId === constants_1.REPORT_TYPES.REQUEST) {
                existing.requisitionQuantity += reportedQuantity;
            }
            unitData.set(item.materialId, existing);
        }
    }
    return liveMaterialDataByUnitId;
};
exports.buildLiveMaterialDataByUnitId = buildLiveMaterialDataByUnitId;
const sumMaterialGroupQuantity = (unitLiveData, groupId, groupToMaterialMap, field) => {
    const groupEntry = unitLiveData.get(groupId);
    const groupQuantity = groupEntry ? (0, exports.parseQuantityValue)(groupEntry[field]) : 0;
    const individualMaterialQuantity = (groupToMaterialMap.get(groupId) ?? [])
        .reduce((total, materialId) => total + (0, exports.parseQuantityValue)(unitLiveData.get(materialId)?.[field]), 0);
    return groupQuantity + individualMaterialQuantity;
};
exports.sumMaterialGroupQuantity = sumMaterialGroupQuantity;
const buildStandardOriginDetails = (standard, baseQuantity, toolCount, groupToMaterialMap) => {
    const totalQuantity = toolCount !== null ? baseQuantity * toolCount : baseQuantity;
    const toolMaterialIds = standard.toolGroupId
        ? (groupToMaterialMap.get(standard.toolGroupId) ?? [])
        : [];
    const toolGroups = standard.toolGroupId
        ? (0, exports.buildStandardMaterialDto)(standard.toolGroupId, standard.toolGroupName ?? standard.toolGroupId, "", constants_1.MATERIAL_TYPES.TOOL)
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
exports.buildStandardOriginDetails = buildStandardOriginDetails;
const buildStandardUnitDto = (unitId, unitInfoByUnitId) => {
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
exports.buildStandardUnitDto = buildStandardUnitDto;
const buildStandardMaterialDto = (id, description, category, type = constants_1.MATERIAL_TYPES.ITEM) => ({
    id,
    description,
    multiply: 1,
    nickname: "",
    category,
    unitOfMeasure: "יח",
    type,
});
exports.buildStandardMaterialDto = buildStandardMaterialDto;
//# sourceMappingURL=standard.utils.js.map