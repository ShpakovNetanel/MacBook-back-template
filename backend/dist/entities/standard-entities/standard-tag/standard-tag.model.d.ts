import { Model } from "sequelize-typescript";
import { TagGroup } from "../tag-group/tag-group.model";
import { UnitStandardTags } from "../unit-standard-tag/unit-standard-tag.model";
import { StandardValues } from "../standard-values/standard-values.model";
export type IStandardTag = {
    id: number;
    tag: string;
    unitLevel: number;
    tagGroupId: number;
};
export declare class StandardTag extends Model<IStandardTag> {
    id: number;
    tag: string;
    unitLevel: number;
    tagGroupId: number;
    tagGroup?: TagGroup;
    unitStandardTags: UnitStandardTags[];
    standardValues: StandardValues[];
}
