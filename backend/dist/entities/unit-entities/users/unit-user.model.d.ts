import { Model } from "sequelize-typescript";
export type IUnitUser = {
    userId: number;
    unitId: number;
    startDate: Date;
    endDate: Date;
};
export declare class UnitUser extends Model<IUnitUser> {
    userId: number;
    unitId: number;
    startDate: Date;
    endDate: Date;
}
