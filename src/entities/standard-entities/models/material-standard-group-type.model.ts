import { Column, DataType, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { CategoryDesc } from "./category-desc.model";
import { StandardGroup } from "./standard-group.model";

export type IMaterialStandardGroupType = {
    id: string;
};

@Table({ tableName: "material_standard_group_types", timestamps: false })
export class MaterialStandardGroupType extends Model<IMaterialStandardGroupType> {
    @PrimaryKey
    @Column(DataType.STRING(20))
    declare id: string;

    @HasMany(() => CategoryDesc)
    declare categories?: CategoryDesc[];

    @HasMany(() => StandardGroup)
    declare groups?: StandardGroup[];
}
