import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Material } from "src/entities/material-entities/material/material.model";
import { Unit } from "src/entities/unit-entities/unit/unit.model";

export type IComment = {
  unitId: number;
  materialId: string;
  date: Date;
  type: number;
  recipientUnitId: number;
  text?: string | null;
};

@Table({ tableName: "comments", timestamps: false })
export class Comment extends Model<IComment> {
  @PrimaryKey
  @ForeignKey(() => Unit)
  @Column({ field: "unit_id", type: DataType.INTEGER })
  declare unitId: number;

  @PrimaryKey
  @ForeignKey(() => Material)
  @Column({ field: "material_id", type: DataType.STRING(18) })
  declare materialId: string;

  @PrimaryKey
  @Column(DataType.DATE)
  declare date: Date;

  @PrimaryKey
  @Column(DataType.INTEGER)
  declare type: number;

  @PrimaryKey
  @ForeignKey(() => Unit)
  @Column({ field: "recipient_unit_id", type: DataType.INTEGER })
  declare recipientUnitId: number;

  @Column(DataType.TEXT)
  declare text: string | null;

  @BelongsTo(() => Material) declare material?: Material;
  @BelongsTo(() => Unit, { foreignKey: "unitId", as: "unit" }) declare unit?: Unit;
  @BelongsTo(() => Unit, { foreignKey: "recipientUnitId", as: "recipientUnit" }) declare recipientUnit?: Unit;
}
