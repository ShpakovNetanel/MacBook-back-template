import { Column, DataType, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { StandardTag } from "../standard-tag/standard-tag.model";

export type ITagGroup = {
    id?: number;
    description: string;
}

@Table({ tableName: 'tag_group', timestamps: false })
export class TagGroup extends Model<ITagGroup> {
    @PrimaryKey
    @Column({ type: DataType.INTEGER, autoIncrement: true })
    declare id: number;

    @Column({ type: DataType.STRING })
    declare description: string;

    @HasMany(() => StandardTag)
    declare tags?: StandardTag[];
}
