import { Model } from "sequelize-typescript";
import { Unit } from "../unit/unit.model";
import { UnitStatus } from "../units-statuses/units-statuses.model";
export type IUnitId = {
    id: number;
};
export declare class UnitId extends Model<IUnitId> {
    id: number;
    details?: Unit[];
    unitStatus?: UnitStatus[];
    get activeDetail(): Unit | undefined;
}
