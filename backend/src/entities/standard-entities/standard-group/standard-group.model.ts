import { DataTypes } from "sequelize";
import { BelongsTo, Column, HasOne, Model, PrimaryKey, Table } from "sequelize-typescript";
import { MaterialNickname } from "../../material-entities/material-nickname/material-nickname.model";
import { CategoryGroup } from "../category-group/category-group.model";

type IStandardGroup = {
    id: string;
    name: string;
    groupType: string;
}

@Table({ tableName: 'standard_groups', timestamps: false })
export class StandardGroup extends Model<IStandardGroup> {
    @PrimaryKey
    @Column(DataTypes.STRING)
    declare id: string;

    @Column(DataTypes.STRING)
    declare name: string;

    @Column({ field: "group_type", type: DataTypes.STRING })
    declare groupType: string;

    @HasOne(() => MaterialNickname, { foreignKey: "materialId", sourceKey: "id", constraints: false, as: "nickname" })
    declare nickname?: MaterialNickname;

    @BelongsTo(() => CategoryGroup, { foreignKey: "id", targetKey: "groupId", constraints: false, as: "categoryGroup" })
    declare categoryGroup?: CategoryGroup;
}
