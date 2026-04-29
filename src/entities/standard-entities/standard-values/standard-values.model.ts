import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { StandardTag } from "../standard-tag/standard-tag.model";
import { StandardAttribute } from "../standard-attribute/standard-attribute.model";

export type IStandardValues = {
    standardId: number;
    tagId: number;
    quantity: number;
    note: string;
}

@Table({ tableName: "standard_values", timestamps: false })
export class StandardValues extends Model<IStandardValues> {
    @PrimaryKey
    @ForeignKey(() => StandardAttribute)
    @Column({ field: 'standard_id', type: DataType.INTEGER })
    declare standardId: number;

    @PrimaryKey
    @ForeignKey(() => StandardTag)
    @Column({ field: 'tag_id', type: DataType.INTEGER })
    declare tagId: number;

    @Column({ type: DataType.INTEGER })
    declare quantity: number;

    @Column({ type: DataType.STRING })
    declare note: string;

    @BelongsTo(() => StandardTag)
    declare tag: StandardTag;
}