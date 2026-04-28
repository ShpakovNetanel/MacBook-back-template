import { Model } from "sequelize-typescript";
import { Material } from "../material/material.model";
export type IMaterialNickname = {
    materialId: string;
    nickname?: string | null;
};
export declare class MaterialNickname extends Model<IMaterialNickname> {
    materialId: string;
    nickname: string | null;
    material?: Material;
}
