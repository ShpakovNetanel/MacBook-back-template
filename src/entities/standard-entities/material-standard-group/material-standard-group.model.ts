import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Material } from "../../material-entities/material/material.model";
import { StandardGroup } from "../standard-group/standard-group.model";

export type IMaterialStandardGroup = {
    groupId: string;
    materialId: string;
};

@Table({ tableName: "material_standard_group", timestamps: false })
export class MaterialStandardGroup extends Model<IMaterialStandardGroup> {
    @PrimaryKey
    @ForeignKey(() => StandardGroup)
    @Column({ field: "group_id", type: DataType.STRING(9) })
    declare groupId: string;

    @PrimaryKey
    @ForeignKey(() => Material)
    @Column({ field: "material_id", type: DataType.STRING(18) })
    declare materialId: string;

    @BelongsTo(() => StandardGroup, { foreignKey: "groupId" })
    declare standardGroup?: StandardGroup;

    @BelongsTo(() => Material, { foreignKey: "materialId" })
    declare material?: Material;
}
