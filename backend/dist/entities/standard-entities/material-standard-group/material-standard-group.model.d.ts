import { Model } from "sequelize-typescript";
import { Material } from "../../material-entities/material/material.model";
import { StandardGroup } from "../standard-group/standard-group.model";
export type IMaterialStandardGroup = {
    groupId: string;
    materialId: string;
};
export declare class MaterialStandardGroup extends Model<IMaterialStandardGroup> {
    groupId: string;
    materialId: string;
    standardGroup?: StandardGroup;
    material?: Material;
}
