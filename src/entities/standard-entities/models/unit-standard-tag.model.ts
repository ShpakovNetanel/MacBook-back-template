import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { UnitId } from "src/entities/unit-entities/unit-id/unit-id.model";
import { StandardTag } from "./standard-tag.model";

export type IUnitStandardTag = {
    unitId: number;
    tagId: number;
};

@Table({ tableName: "unit_standard_tags", timestamps: false })
export class UnitStandardTag extends Model<IUnitStandardTag> {
    @PrimaryKey
    @ForeignKey(() => UnitId)
    @Column({ field: "unit_id", type: DataType.INTEGER })
    declare unitId: number;

    @PrimaryKey
    @ForeignKey(() => StandardTag)
    @Column({ field: "tag_id", type: DataType.INTEGER })
    declare tagId: number;

    @BelongsTo(() => UnitId)
    declare unit?: UnitId;

    @BelongsTo(() => StandardTag)
    declare tag?: StandardTag;
}
