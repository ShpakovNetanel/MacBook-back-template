import { Transaction } from "sequelize";
import { UnitRelation } from "../unit-relations/unit-relation.model";
import { IUnitStatus, UnitStatus } from "./units-statuses.model";
export declare class UnitStatusRepository {
    private readonly unitStatusModel;
    private readonly unitRelationModel;
    constructor(unitStatusModel: typeof UnitStatus, unitRelationModel: typeof UnitRelation);
    fetchHierarchyUnitIds(date: string, unitIds: number[], transaction?: Transaction): Promise<number[]>;
    updateStatuses(unitsStatuses: IUnitStatus[], transaction?: Transaction): Promise<UnitStatus[]>;
    clearStatusesForUnitsDate(unitIds: number[], date: string, transaction: Transaction): Promise<number>;
    clearStatusForUnitDate(unitId: number, date: string, transaction?: Transaction): Promise<number>;
}
