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
import { MaterialStandardGroup } from "./material-standard-group.model";
import { MaterialStandardGroupType } from "./material-standard-group-type.model";
import { StandardAttribute } from "./standard-attribute.model";

export type IStandardGroup = {
    id: string;
    name: string;
    groupType: string;
};

@Table({ tableName: "standard_groups", timestamps: false })
export class StandardGroup extends Model<IStandardGroup> {
    @PrimaryKey
    @Column(DataType.STRING(9))
    declare id: string;

    @Column(DataType.STRING(40))
    declare name: string;

    @ForeignKey(() => MaterialStandardGroupType)
    @Column({ field: "group_type", type: DataType.STRING(20) })
    declare groupType: string;

    @BelongsTo(() => MaterialStandardGroupType)
    declare type?: MaterialStandardGroupType;

    @HasMany(() => CategoryGroup, { foreignKey: "groupId" })
    declare categoryGroups?: CategoryGroup[];

    @HasMany(() => MaterialStandardGroup, { foreignKey: "groupId" })
    declare materialStandardGroups?: MaterialStandardGroup[];


    @HasMany(() => StandardAttribute, { foreignKey: "itemGroupId" })
    declare itemStandardAttributes?: StandardAttribute[];

    @HasMany(() => StandardAttribute, { foreignKey: "toolGroupId" })
    declare toolStandardAttributes?: StandardAttribute[];
}
