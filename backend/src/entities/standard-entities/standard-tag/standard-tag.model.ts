import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { TagGroup } from "../tag-group/tag-group.model";
import { UnitStandardTags } from "../unit-standard-tag/unit-standard-tag.model";
import { StandardValues } from "../standard-values/standard-values.model";

export type IStandardTag = {
    id: number;
    tag: string;
    unitLevel: number;
    tagGroupId: number;
}

@Table({ tableName: 'standard_tags', timestamps: false })
export class StandardTag extends Model<IStandardTag> {
    @PrimaryKey
    @Column({ type: DataType.INTEGER })
    declare id: number;

    @Column({ type: DataType.STRING })
    declare tag: string;

    @Column({ type: DataType.INTEGER, field: 'unit_level' })
    declare unitLevel: number;

    @ForeignKey(() => TagGroup)
    @Column({ type: DataType.INTEGER, field: 'tag_group_id' })
    declare tagGroupId: number;

    @BelongsTo(() => TagGroup)
    declare tagGroup?: TagGroup;

    @HasMany(() => UnitStandardTags)
    declare unitStandardTags: UnitStandardTags[];

    @HasMany(() => StandardValues)
    declare standardValues: StandardValues[];
}