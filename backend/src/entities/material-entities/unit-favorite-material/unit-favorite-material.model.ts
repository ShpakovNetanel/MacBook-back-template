import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Material } from "../material/material.model";
import { UnitId } from "../../unit-entities/unit-id/unit-id.model";

export type IUnitFavoriteMaterial = { unitId: number; materialId: string };

@Table({ tableName: "units_favorite_materials", timestamps: false })
export class UnitFavoriteMaterial extends Model<IUnitFavoriteMaterial> {
  @PrimaryKey
  @ForeignKey(() => UnitId)
  @Column({ field: "unit_id", type: DataType.INTEGER })
  declare unitId: number;

  @PrimaryKey
  @Column({ field: "material_id", type: DataType.STRING(18) })
  declare materialId: string;

  @BelongsTo(() => UnitId) declare unit?: UnitId;
  @BelongsTo(() => Material, { foreignKey: "materialId", targetKey: "id", constraints: false }) declare material?: Material;
}
