import { UnitRelation } from "../../../unit-relations/unit-relation.model";
import { UnitHierarchyNode } from "../unit-hierarchy.types";
export declare const getEmergencyUnitIds: (unitRelations: UnitRelation[]) => Set<number>;
export declare const getRootUnit: (unitRelations: UnitRelation[], unitId: number, emergencyUnitIds?: Set<number>) => UnitHierarchyNode | null;
export declare const getHierarchy: (unitsRelations: UnitRelation[], unitsChildren: UnitRelation[], emergencyUnitIds?: Set<number>) => UnitHierarchyNode[];
