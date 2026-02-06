import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Material } from "src/entities/material-entities/material/material.model";
import { Unit } from "src/entities/unit-entities/unit/unit.model";

export type IStock = {
  materialId: string;
  unitId: number;
  stockType: number;
  grade: string;
  date: Date;
  quantity: string | number;
};

@Table({ tableName: "stocks", timestamps: false })
export class Stock extends Model<IStock> {
  @PrimaryKey
  @ForeignKey(() => Material)
  @Column({ field: "material_id", type: DataType.STRING(18) })
  declare materialId: string;

  @PrimaryKey
  @ForeignKey(() => Unit)
  @Column({ field: "unit_id", type: DataType.INTEGER })
  declare unitId: number;

  @PrimaryKey
  @Column({ field: "stock_type", type: DataType.INTEGER })
  declare stockType: number;

  @PrimaryKey
  @Column(DataType.STRING(2))
  declare grade: string;

  @PrimaryKey
  @Column(DataType.DATE)
  declare date: Date;

  @Column(DataType.DECIMAL)
  declare quantity: string;

  @BelongsTo(() => Material) declare material?: Material;
  @BelongsTo(() => Unit) declare unit?: Unit;
}
