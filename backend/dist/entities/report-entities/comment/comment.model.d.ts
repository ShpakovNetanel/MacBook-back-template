import { Model } from "sequelize-typescript";
import { Material } from "../../material-entities/material/material.model";
import { UnitId } from "../../unit-entities/unit-id/unit-id.model";
export type IComment = {
    unitId: number;
    materialId: string;
    date: Date;
    type: number;
    recipientUnitId: number;
    text?: string | null;
};
export declare class Comment extends Model<IComment> {
    unitId: number;
    materialId: string;
    date: Date;
    type: number;
    recipientUnitId: number;
    text: string | null;
    material?: Material;
    unit?: UnitId;
    recipientUnit?: UnitId;
}
