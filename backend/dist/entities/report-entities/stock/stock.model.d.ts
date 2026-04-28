import { Model } from "sequelize-typescript";
import { Material } from "../../material-entities/material/material.model";
import { UnitId } from "../../unit-entities/unit-id/unit-id.model";
export type IStock = {
    materialId: string;
    unitId: number;
    stockType: number;
    grade: string;
    date: Date;
    quantity: string | number;
};
export declare class Stock extends Model<IStock> {
    materialId: string;
    unitId: number;
    stockType: number;
    grade: string;
    date: Date;
    quantity: string;
    material?: Material;
    unit?: UnitId;
}
