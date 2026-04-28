import { Model } from "sequelize-typescript";
import { StandardTag } from "../standard-tag/standard-tag.model";
export type IStandardValues = {
    standardId: number;
    tagId: number;
    quantity: number;
    note: string;
};
export declare class StandardValues extends Model<IStandardValues> {
    standardId: number;
    tagId: number;
    quantity: number;
    note: string;
    tag: StandardTag;
}
