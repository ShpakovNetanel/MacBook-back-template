import { Column, DataType, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { StandardTag } from "./standard-tag.model";

export type ITagGroup = {
    id: number;
    description: string;
};

@Table({ tableName: "tag_group", timestamps: false })
export class TagGroup extends Model<ITagGroup> {
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: number;

    @Column(DataType.STRING(30))
    declare description: string;

    @HasMany(() => StandardTag)
    declare tags?: StandardTag[];
}
