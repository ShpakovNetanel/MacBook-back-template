import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { CategoryDesc } from "./category-desc.model";
import { StandardGroup } from "./standard-group.model";

export type ICategoryGroup = {
    id: string;
    groupId: string;
};

@Table({ tableName: "category_groups", timestamps: false })
export class CategoryGroup extends Model<ICategoryGroup> {
    @PrimaryKey
    @ForeignKey(() => CategoryDesc)
    @Column(DataType.STRING(9))
    declare id: string;

    @PrimaryKey
    @ForeignKey(() => StandardGroup)
    @Column({ field: "group_id", type: DataType.STRING(9) })
    declare groupId: string;

    @BelongsTo(() => CategoryDesc)
    declare category?: CategoryDesc;

    @BelongsTo(() => StandardGroup)
    declare group?: StandardGroup;
}
