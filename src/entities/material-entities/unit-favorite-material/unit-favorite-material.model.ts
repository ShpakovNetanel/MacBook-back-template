import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Material } from "../material/material.model";
import { Unit } from "src/entities/unit-entities/unit/unit.model";

export type IUnitFavoriteMaterial = { unitId: number; materialId: string };

@Table({ tableName: "units_favorite_materials", timestamps: false })
export class UnitFavoriteMaterial extends Model<IUnitFavoriteMaterial> {
  @PrimaryKey
  @ForeignKey(() => Unit)
  @Column({ field: "unit_id", type: DataType.INTEGER })
  declare unitId: number;

  @PrimaryKey
  @ForeignKey(() => Material)
  @Column({ field: "material_id", type: DataType.STRING(18) })
  declare materialId: string;

  @BelongsTo(() => Unit) declare unit?: Unit;
  @BelongsTo(() => Material) declare material?: Material;
}
