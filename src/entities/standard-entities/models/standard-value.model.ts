import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { StandardAttribute } from "./standard-attribute.model";
import { StandardTag } from "./standard-tag.model";

export type IStandardValue = {
    standardId: number;
    tagId: number;
    quantity: number | null;
    note: string | null;
};

@Table({ tableName: "standard_values", timestamps: false })
export class StandardValue extends Model<IStandardValue> {
    @PrimaryKey
    @ForeignKey(() => StandardAttribute)
    @Column({ field: "standard_id_", type: DataType.INTEGER })
    declare standardId: number;

    @PrimaryKey
    @ForeignKey(() => StandardTag)
    @Column({ field: "tag_id", type: DataType.INTEGER })
    declare tagId: number;

    @Column({ type: DataType.DECIMAL(44), allowNull: true })
    declare quantity: number | null;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare note: string | null;

    @BelongsTo(() => StandardAttribute)
    declare standard?: StandardAttribute;

    @BelongsTo(() => StandardTag)
    declare tag?: StandardTag;
}
