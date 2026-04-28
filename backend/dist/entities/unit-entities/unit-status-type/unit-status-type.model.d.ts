import { Model } from "sequelize-typescript";
export type IUnitStatusType = {
    id: number;
    description: string;
};
export declare class UnitStatusType extends Model<IUnitStatusType> {
    id: number;
    description: string;
}
