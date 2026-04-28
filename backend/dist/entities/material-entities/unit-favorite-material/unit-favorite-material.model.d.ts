import { Model } from "sequelize-typescript";
import { Material } from "../material/material.model";
import { UnitId } from "../../unit-entities/unit-id/unit-id.model";
export type IUnitFavoriteMaterial = {
    unitId: number;
    materialId: string;
};
export declare class UnitFavoriteMaterial extends Model<IUnitFavoriteMaterial> {
    unitId: number;
    materialId: string;
    unit?: UnitId;
    material?: Material;
}
