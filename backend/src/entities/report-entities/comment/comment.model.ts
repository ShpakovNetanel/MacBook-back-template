import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Material } from "../../material-entities/material/material.model";
import { UnitId } from "../../unit-entities/unit-id/unit-id.model";

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
  @ForeignKey(() => UnitId)
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
  @ForeignKey(() => UnitId)
  @Column({ field: "recipient_unit_id", type: DataType.INTEGER })
  declare recipientUnitId: number;

  @Column(DataType.TEXT)
  declare text: string | null;

  @BelongsTo(() => Material) declare material?: Material;
  @BelongsTo(() => UnitId, { foreignKey: "unitId", as: "unit" }) declare unit?: UnitId;
  @BelongsTo(() => UnitId, { foreignKey: "recipientUnitId", as: "recipientUnit" }) declare recipientUnit?: UnitId;
}
