import { Model } from "sequelize-typescript";
import { UnitId } from "../unit-id/unit-id.model";
export type IUnit = {
    unitId: number;
    startDate: Date;
    endDate: Date;
    objectType: string;
    description?: string | null;
    unitLevelId: number;
    unitTypeId?: number | null;
    tsavIrgunCodeId?: string | null;
};
export declare class Unit extends Model<IUnit> {
    unitId: number;
    startDate: Date;
    endDate: Date;
    objectType: string;
    description: string | null;
    unitLevelId: number;
    unitTypeId: number | null;
    tsavIrgunCodeId: string | null;
    unit?: UnitId;
}
