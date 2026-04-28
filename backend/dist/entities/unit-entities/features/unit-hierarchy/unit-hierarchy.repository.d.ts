import { Transaction } from "sequelize";
import { UnitRelation } from "../../unit-relations/unit-relation.model";
import { Unit } from "../../unit/unit.model";
import { UnitStatus } from "../../units-statuses/units-statuses.model";
export type UnitRelationEdge = {
    unitId: number;
    relatedUnitId: number;
};
export type UnitDirectParentRelation = {
    unitId: number;
    relatedUnitId: number;
};
export type UnitDetailSnapshot = {
    unitId: number;
    description: string | null;
    level: number | null;
    simul: string | null;
};
export type UnitStatusSnapshot = {
    id: number;
    description: string;
};
export type UnitLookupRow = {
    unitId: number;
    description: string | null;
    unitLevelId: number | null;
    simul: string | null;
    statusId: number;
    statusDescription: string;
};
export declare class UnitHierarchyRepository {
    private readonly unitRelationModel;
    private readonly unitStatusTypesModel;
    private readonly unitDetailModel;
    constructor(unitRelationModel: typeof UnitRelation, unitStatusTypesModel: typeof UnitStatus, unitDetailModel: typeof Unit);
    fetchActive(date: string, unitId?: number): Promise<UnitRelation[]>;
    fetchAllActiveUnitDetails(date: string): Promise<Unit[]>;
    fetchUnitsForExcelImport(date: string, { unitIds, unitSimuls, }: {
        unitIds?: number[];
        unitSimuls?: string[];
    }): Promise<UnitLookupRow[]>;
    fetchUnitStatusesForDate(date: string, unitIds: number[]): Promise<UnitStatus[]>;
    fetchDirectParentRelations(date: string, childUnitIds: number[]): Promise<UnitRelation[]>;
    isUnitUnderRootUnit(date: string, rootUnitId: number, lowerUnitId: number, transaction?: Transaction): Promise<boolean>;
    fetchUnitsActiveDetails(date: string, unitIds: number[], transaction?: Transaction): Promise<Unit[]>;
    createParentRelation(upperUnit: number, lowerUnit: number, date: string, transaction?: Transaction): Promise<[UnitRelation, boolean | null]>;
    fetchCurrentParentRelation(lowerUnit: number, date: string, transaction?: Transaction): Promise<UnitRelation | null>;
    fetchUnitStatusForDate(unitId: number, date: string, transaction?: Transaction): Promise<UnitStatus | null>;
    closeRelationOnDate(relation: UnitRelation, date: string, transaction?: Transaction): Promise<UnitRelation>;
}
