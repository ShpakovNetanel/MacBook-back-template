"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInventoryCalculationResults = exports.aggregateGdudQuantitiesToAncestors = exports.collectUnitsForLockedDirectChildBranches = exports.buildUnitMaterialQuantityMap = exports.buildParentByChildForConnectedUnits = exports.buildUnitLevelById = exports.buildChildIdsByParent = exports.collectMaterialIdsFromReports = void 0;
const constants_1 = require("../../../../constants");
const sortNumericAsc = (values) => [...values].sort((left, right) => left - right);
const collectMaterialIdsFromReports = (reports) => {
    const materialIds = new Set();
    for (const report of reports) {
        for (const item of report.items ?? []) {
            if (!item.materialId)
                continue;
            materialIds.add(item.materialId);
        }
    }
    return Array.from(materialIds);
};
exports.collectMaterialIdsFromReports = collectMaterialIdsFromReports;
const buildChildIdsByParent = (relations) => {
    const childIdsByParent = new Map();
    for (const relation of relations) {
        const childIds = childIdsByParent.get(relation.unitId) ?? [];
        childIds.push(relation.relatedUnitId);
        childIdsByParent.set(relation.unitId, childIds);
    }
    return childIdsByParent;
};
exports.buildChildIdsByParent = buildChildIdsByParent;
const buildUnitLevelById = (relations) => {
    const unitLevelById = new Map();
    for (const relation of relations) {
        const parentLevel = relation.unit?.details?.[0]?.unitLevelId;
        const childLevel = relation.relatedUnit?.details?.[0]?.unitLevelId;
        if (parentLevel !== undefined && !unitLevelById.has(relation.unitId)) {
            unitLevelById.set(relation.unitId, parentLevel);
        }
        if (childLevel !== undefined && !unitLevelById.has(relation.relatedUnitId)) {
            unitLevelById.set(relation.relatedUnitId, childLevel);
        }
    }
    return unitLevelById;
};
exports.buildUnitLevelById = buildUnitLevelById;
const buildParentByChildForConnectedUnits = (connectedUnitIds, parentsByChild, connectedUnitSet) => {
    const parentByChild = new Map();
    for (const childUnitId of connectedUnitIds) {
        const directParentId = sortNumericAsc((parentsByChild.get(childUnitId) ?? []).filter((parentUnitId) => connectedUnitSet.has(parentUnitId)))[0];
        if (directParentId !== undefined) {
            parentByChild.set(childUnitId, directParentId);
        }
    }
    return parentByChild;
};
exports.buildParentByChildForConnectedUnits = buildParentByChildForConnectedUnits;
const buildUnitMaterialQuantityMap = (quantities) => {
    const quantityByUnitMaterial = new Map();
    for (const quantityRow of quantities) {
        const mapKey = `${quantityRow.unitId}:${quantityRow.materialId}`;
        quantityByUnitMaterial.set(mapKey, (quantityByUnitMaterial.get(mapKey) ?? 0) + Number(quantityRow.quantity ?? 0));
    }
    return quantityByUnitMaterial;
};
exports.buildUnitMaterialQuantityMap = buildUnitMaterialQuantityMap;
const collectUnitsForLockedDirectChildBranches = (screenUnitId, childrenByParent, unitsById) => {
    const directChildIds = sortNumericAsc(childrenByParent.get(screenUnitId) ?? []);
    const lockedDirectChildIds = directChildIds.filter((directChildId) => {
        const statusId = unitsById.get(directChildId)?.status?.id ?? constants_1.UNIT_STATUSES.REQUESTING;
        return statusId === constants_1.UNIT_STATUSES.WAITING_FOR_ALLOCATION;
    });
    const includedUnitIds = new Set([screenUnitId]);
    const queue = [...lockedDirectChildIds];
    while (queue.length > 0) {
        const currentUnitId = queue.shift();
        if (currentUnitId === undefined || includedUnitIds.has(currentUnitId))
            continue;
        includedUnitIds.add(currentUnitId);
        for (const childUnitId of childrenByParent.get(currentUnitId) ?? []) {
            if (includedUnitIds.has(childUnitId))
                continue;
            queue.push(childUnitId);
        }
    }
    return sortNumericAsc(Array.from(includedUnitIds));
};
exports.collectUnitsForLockedDirectChildBranches = collectUnitsForLockedDirectChildBranches;
const aggregateGdudQuantitiesToAncestors = (gdudQuantitiesByUnitMaterial, parentByChild, connectedUnitSet, screenUnitId, includeGdudUnit = false) => {
    const aggregatedByUnitMaterial = new Map();
    for (const [unitMaterialKey, quantity] of gdudQuantitiesByUnitMaterial.entries()) {
        const [gdudUnitIdAsString, materialId] = unitMaterialKey.split(":");
        const gdudUnitId = Number(gdudUnitIdAsString);
        if (!gdudUnitId || !materialId)
            continue;
        if (includeGdudUnit && connectedUnitSet.has(gdudUnitId)) {
            const gdudKey = `${gdudUnitId}:${materialId}`;
            aggregatedByUnitMaterial.set(gdudKey, (aggregatedByUnitMaterial.get(gdudKey) ?? 0) + quantity);
        }
        let currentParentId = parentByChild.get(gdudUnitId);
        while (currentParentId !== undefined && connectedUnitSet.has(currentParentId)) {
            const parentKey = `${currentParentId}:${materialId}`;
            aggregatedByUnitMaterial.set(parentKey, (aggregatedByUnitMaterial.get(parentKey) ?? 0) + quantity);
            if (currentParentId === screenUnitId)
                break;
            currentParentId = parentByChild.get(currentParentId);
        }
    }
    return aggregatedByUnitMaterial;
};
exports.aggregateGdudQuantitiesToAncestors = aggregateGdudQuantitiesToAncestors;
const buildInventoryCalculationResults = (aggregatedInventoryByUnitMaterial, aggregatedUsageByUnitMaterial) => {
    const allUnitMaterialKeys = new Set([
        ...aggregatedInventoryByUnitMaterial.keys(),
        ...aggregatedUsageByUnitMaterial.keys(),
    ]);
    return Array
        .from(allUnitMaterialKeys)
        .map((unitMaterialKey) => {
        const [unitIdAsString, materialId] = unitMaterialKey.split(":");
        const aggregatedInventoryQuantity = aggregatedInventoryByUnitMaterial.get(unitMaterialKey) ?? 0;
        const aggregatedUsageQuantity = aggregatedUsageByUnitMaterial.get(unitMaterialKey) ?? 0;
        return {
            materialId,
            unitId: Number(unitIdAsString),
            quantity: Math.max(aggregatedInventoryQuantity - aggregatedUsageQuantity, 0),
        };
    })
        .sort((left, right) => {
        if (left.unitId !== right.unitId)
            return left.unitId - right.unitId;
        return left.materialId.localeCompare(right.materialId);
    });
};
exports.buildInventoryCalculationResults = buildInventoryCalculationResults;
//# sourceMappingURL=report-service.utils.js.map