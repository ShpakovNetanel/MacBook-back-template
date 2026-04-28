import { Model } from "sequelize-typescript";
import { UnitStatusType } from "../unit-status-type/unit-status-type.model";
import { UnitId } from "../unit-id/unit-id.model";
export type IUnitStatus = {
    unitId: number;
    unitStatusId: number;
    date: Date;
};
export declare class UnitStatus extends Model<IUnitStatus> {
    unitId: number;
    date: Date;
    unitStatusId: number;
    unitStatus?: UnitStatusType;
    unit?: UnitId;
}
