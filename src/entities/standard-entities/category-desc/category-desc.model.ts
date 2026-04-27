import { Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";

type ICategoryDesc = {
    id: string;
    description: string;
    categoryType: string;
    isAgainstTool: boolean;
}

@Table({ tableName: 'category_desc', timestamps: false })
export class CategoryDesc extends Model<ICategoryDesc> {
    @PrimaryKey
    @Column({ type: DataType.STRING })
    declare id: string;

    @Column({ type: DataType.STRING })
    declare description: string;

    @Column({ type: DataType.STRING, field: 'category_type' })
    declare categoryType: string;

    @Column({ type: DataType.BOOLEAN, field: 'is_against_tool' })
    declare isAgainstTool: boolean;
}