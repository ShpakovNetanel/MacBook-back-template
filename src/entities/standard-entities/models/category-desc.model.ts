import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    PrimaryKey,
    Table,
} from "sequelize-typescript";
import { CategoryGroup } from "./category-group.model";
import { MaterialStandardGroupType } from "./material-standard-group-type.model";

export type ICategoryDesc = {
    id: string;
    description: string;
    categoryType: string;
    isAgainstTool: boolean;
};

@Table({ tableName: "category_desc", timestamps: false })
export class CategoryDesc extends Model<ICategoryDesc> {
    @PrimaryKey
    @Column(DataType.STRING(9))
    declare id: string;

    @Column(DataType.STRING(40))
    declare description: string;

    @ForeignKey(() => MaterialStandardGroupType)
    @Column({ field: "category_type", type: DataType.STRING(20) })
    declare categoryType: string;

    @Column({ field: "is_against_tool", type: DataType.BOOLEAN })
    declare isAgainstTool: boolean;

    @BelongsTo(() => MaterialStandardGroupType)
    declare type?: MaterialStandardGroupType;

    @HasMany(() => CategoryGroup)
    declare categoryGroups?: CategoryGroup[];
}
