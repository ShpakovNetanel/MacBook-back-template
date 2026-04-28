import { UnitRelation } from "../../../unit-entities/unit-relations/unit-relation.model";
import type { Report } from "../report.model";
import type { AggregateUnitDto, InventoryCalculationResultDto } from "../report.types";
export declare const collectMaterialIdsFromReports: (reports: Report[]) => string[];
export declare const buildChildIdsByParent: (relations: UnitRelation[]) => Map<number, number[]>;
export declare const buildUnitLevelById: (relations: UnitRelation[]) => Map<number, number>;
export declare const buildParentByChildForConnectedUnits: (connectedUnitIds: number[], parentsByChild: Map<number, number[]>, connectedUnitSet: Set<number>) => Map<number, number>;
export declare const buildUnitMaterialQuantityMap: (quantities: Array<{
    unitId: number;
    materialId: string;
    quantity: number;
}>) => Map<string, number>;
export declare const collectUnitsForLockedDirectChildBranches: (screenUnitId: number, childrenByParent: Map<number, number[]>, unitsById: Map<number, AggregateUnitDto>) => number[];
export declare const aggregateGdudQuantitiesToAncestors: (gdudQuantitiesByUnitMaterial: Map<string, number>, parentByChild: Map<number, number>, connectedUnitSet: Set<number>, screenUnitId: number, includeGdudUnit?: boolean) => Map<string, number>;
export declare const buildInventoryCalculationResults: (aggregatedInventoryByUnitMaterial: Map<string, number>, aggregatedUsageByUnitMaterial: Map<string, number>) => InventoryCalculationResultDto[];
