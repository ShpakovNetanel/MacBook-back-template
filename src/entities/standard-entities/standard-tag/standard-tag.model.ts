import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { TagGroup } from "../tag-group/tag-group.model";

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
}