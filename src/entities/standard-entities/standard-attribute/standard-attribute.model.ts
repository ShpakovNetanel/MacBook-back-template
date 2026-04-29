import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { UnitId } from "src/entities/unit-entities/unit-id/unit-id.model";
import { StandardGroup } from "../standard-group/standard-group.model";
import { StandardValues } from "../standard-values/standard-values.model";

export type IStandardAttribute = {
    id: number;
    managingUnit: number;
    itemGroupId: string;
    toolGroupId: string | null;
};

@Table({ tableName: "standard_attributes", timestamps: false })
export class StandardAttribute extends Model<IStandardAttribute> {
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: number;

    @ForeignKey(() => UnitId)
    @Column({ field: "managing_unit", type: DataType.INTEGER })
    declare managingUnit: number;

    @ForeignKey(() => StandardGroup)
    @Column({ field: "item_group_id", type: DataType.STRING(9) })
    declare itemGroupId: string;

    @ForeignKey(() => StandardGroup)
    @Column({ field: "tool_group_id", type: DataType.STRING(9), allowNull: true })
    declare toolGroupId: string | null;

    @BelongsTo(() => UnitId)
    declare managingUnitDetails?: UnitId;

    @BelongsTo(() => StandardGroup, { foreignKey: "itemGroupId" })
    declare itemGroup?: StandardGroup;

    @BelongsTo(() => StandardGroup, { foreignKey: "toolGroupId" })
    declare toolGroup?: StandardGroup;

    @HasMany(() => StandardValues)
    declare values?: StandardValues[];
}
