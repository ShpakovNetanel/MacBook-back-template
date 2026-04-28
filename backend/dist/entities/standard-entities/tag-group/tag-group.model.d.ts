import { Model } from "sequelize-typescript";
import { StandardTag } from "../standard-tag/standard-tag.model";
export type ITagGroup = {
    id?: number;
    description: string;
};
export declare class TagGroup extends Model<ITagGroup> {
    id: number;
    description: string;
    tags?: StandardTag[];
}
