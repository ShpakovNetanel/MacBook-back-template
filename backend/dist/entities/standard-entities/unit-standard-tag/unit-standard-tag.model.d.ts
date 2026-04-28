import { Model } from "sequelize-typescript";
import { UnitId } from "../../unit-entities/unit-id/unit-id.model";
import { StandardTag } from "../standard-tag/standard-tag.model";
export type IUnitStandardTags = {
    tagId: number;
    unitId: number;
};
export declare class UnitStandardTags extends Model<IUnitStandardTags> {
    tagId: number;
    unitId: number;
    Unit: UnitId;
    tag: StandardTag;
}
