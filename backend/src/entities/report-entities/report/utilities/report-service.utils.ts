import { UNIT_LEVELS, UNIT_STATUSES } from "../../../../constants";
import { UnitRelation } from "../../../unit-entities/unit-relations/unit-relation.model";
import type { Report } from "../report.model";
import type { AggregateUnitDto, InventoryCalculationResultDto } from "../report.types";

const sortNumericAsc = (values: number[]) => [...values].sort((left, right) => left - right);

export const collectMaterialIdsFromReports = (reports: Report[]): string[] => {
    const materialIds = new Set<string>();

    for (const report of reports) {
        for (const item of report.items ?? []) {
            if (!item.materialId) continue;
            materialIds.add(item.materialId);
        }
    }

    return Array.from(materialIds);
};

export const buildChildIdsByParent = (relations: UnitRelation[]): Map<number, number[]> => {
    const childIdsByParent = new Map<number, number[]>();

    for (const relation of relations) {
        const childIds = childIdsByParent.get(relation.unitId) ?? [];
        childIds.push(relation.relatedUnitId);
        childIdsByParent.set(relation.unitId, childIds);
    }

    return childIdsByParent;
};

export const buildUnitLevelById = (relations: UnitRelation[]): Map<number, number> => {
    const unitLevelById = new Map<number, number>();

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

export const buildParentByChildForConnectedUnits = (
    connectedUnitIds: number[],
    parentsByChild: Map<number, number[]>,
    connectedUnitSet: Set<number>
): Map<number, number> => {
    const parentByChild = new Map<number, number>();

    for (const childUnitId of connectedUnitIds) {
        const directParentId = sortNumericAsc(
            (parentsByChild.get(childUnitId) ?? []).filter((parentUnitId) => connectedUnitSet.has(parentUnitId))
        )[0];

        if (directParentId !== undefined) {
            parentByChild.set(childUnitId, directParentId);
        }
    }

    return parentByChild;
};

export const buildUnitMaterialQuantityMap = (
    quantities: Array<{ unitId: number; materialId: string; quantity: number }>
): Map<string, number> => {
    const quantityByUnitMaterial = new Map<string, number>();

    for (const quantityRow of quantities) {
        const mapKey = `${quantityRow.unitId}:${quantityRow.materialId}`;
        quantityByUnitMaterial.set(
            mapKey,
            (quantityByUnitMaterial.get(mapKey) ?? 0) + Number(quantityRow.quantity ?? 0)
        );
    }

    return quantityByUnitMaterial;
};

export const collectUnitsForLockedDirectChildBranches = (
    screenUnitId: number,
    childrenByParent: Map<number, number[]>,
    unitsById: Map<number, AggregateUnitDto>
): number[] => {
    const directChildIds = sortNumericAsc(childrenByParent.get(screenUnitId) ?? []);
    const lockedDirectChildIds = directChildIds.filter((directChildId) => {
        const statusId = unitsById.get(directChildId)?.status?.id ?? UNIT_STATUSES.REQUESTING;
        return statusId === UNIT_STATUSES.WAITING_FOR_ALLOCATION;
    });

    const includedUnitIds = new Set<number>([screenUnitId]);
    const queue = [...lockedDirectChildIds];

    while (queue.length > 0) {
        const currentUnitId = queue.shift();
        if (currentUnitId === undefined || includedUnitIds.has(currentUnitId)) continue;

        includedUnitIds.add(currentUnitId);

        for (const childUnitId of childrenByParent.get(currentUnitId) ?? []) {
            if (includedUnitIds.has(childUnitId)) continue;
            queue.push(childUnitId);
        }
    }

    return sortNumericAsc(Array.from(includedUnitIds));
};

export const aggregateGdudQuantitiesToAncestors = (
    gdudQuantitiesByUnitMaterial: Map<string, number>,
    parentByChild: Map<number, number>,
    connectedUnitSet: Set<number>,
    screenUnitId: number,
    includeGdudUnit: boolean = false
): Map<string, number> => {
    const aggregatedByUnitMaterial = new Map<string, number>();

    for (const [unitMaterialKey, quantity] of gdudQuantitiesByUnitMaterial.entries()) {
        const [gdudUnitIdAsString, materialId] = unitMaterialKey.split(":");
        const gdudUnitId = Number(gdudUnitIdAsString);
        if (!gdudUnitId || !materialId) continue;

        if (includeGdudUnit && connectedUnitSet.has(gdudUnitId)) {
            const gdudKey = `${gdudUnitId}:${materialId}`;
            aggregatedByUnitMaterial.set(
                gdudKey,
                (aggregatedByUnitMaterial.get(gdudKey) ?? 0) + quantity
            );
        }

        let currentParentId = parentByChild.get(gdudUnitId);
        while (currentParentId !== undefined && connectedUnitSet.has(currentParentId)) {
            const parentKey = `${currentParentId}:${materialId}`;
            aggregatedByUnitMaterial.set(
                parentKey,
                (aggregatedByUnitMaterial.get(parentKey) ?? 0) + quantity
            );

            if (currentParentId === screenUnitId) break;
            currentParentId = parentByChild.get(currentParentId);
        }
    }

    return aggregatedByUnitMaterial;
};

export const buildInventoryCalculationResults = (
    aggregatedInventoryByUnitMaterial: Map<string, number>,
    aggregatedUsageByUnitMaterial: Map<string, number>
): InventoryCalculationResultDto[] => {
    const allUnitMaterialKeys = new Set<string>([
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
            if (left.unitId !== right.unitId) return left.unitId - right.unitId;
            return left.materialId.localeCompare(right.materialId);
        });
};
