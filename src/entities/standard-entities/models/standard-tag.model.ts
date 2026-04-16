import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { TagGroup } from "./tag-group.model";
import { UnitStandardTag } from "./unit-standard-tag.model";
import { StandardValue } from "./standard-value.model";

export type IStandardTag = {
    id: number;
    unitLevel: number;
    tag: string;
    tagGroupId: number;
};

@Table({ tableName: "standard_tags", timestamps: false })
export class StandardTag extends Model<IStandardTag> {
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({ field: "unit_level", type: DataType.INTEGER })
    declare unitLevel: number;

    @Column({ field: "tag", type: DataType.STRING(30), unique: true })
    declare tag: string;

    @ForeignKey(() => TagGroup)
    @Column({ field: "tag_group_id", type: DataType.INTEGER })
    declare tagGroupId: number;

    @BelongsTo(() => TagGroup)
    declare tagGroup?: TagGroup;

    @HasMany(() => UnitStandardTag)
    declare unitTags?: UnitStandardTag[];

    @HasMany(() => StandardValue)
    declare standardValues?: StandardValue[];
}
