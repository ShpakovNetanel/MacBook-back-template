import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { CategoryDesc } from "../category-desc/category-desc.model";

type ICategoryGroup = {
    id: string;
    groupId: string;
}   

@Table({
    tableName: 'category_groups',
    timestamps: false,
})
export class CategoryGroup extends Model<ICategoryGroup> {
    @PrimaryKey
    @ForeignKey(() => CategoryDesc)
    @Column({ type: DataType.STRING })
    declare id: string;

    @PrimaryKey
    @Column({ type: DataType.STRING, field: 'group_id' })
    declare groupId: string;

    @BelongsTo(() => CategoryDesc, { foreignKey: "id", targetKey: "id", constraints: false, as: "categoryDesc" })
    declare categoryDesc?: CategoryDesc;
}
