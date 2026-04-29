import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { UnitId } from "../../unit-entities/unit-id/unit-id.model";
import { StandardTag } from "../standard-tag/standard-tag.model";

export type IUnitStandardTags = {
    tagId: number;
    unitId: number;
}

@Table({ tableName: 'unit_standard_tags', timestamps: false })
export class UnitStandardTags extends Model<IUnitStandardTags> {
    @PrimaryKey
    @ForeignKey(() => StandardTag)
    @Column({ field: 'tag_id', type: DataType.INTEGER })
    declare tagId: number;

    @PrimaryKey
    @ForeignKey(() => UnitId)
    @Column({ field: 'unit_id', type: DataType.INTEGER })
    declare unitId: number;

    @BelongsTo(() => UnitId)
    declare Unit: UnitId;

    @BelongsTo(() => StandardTag)
    declare tag: StandardTag;
}