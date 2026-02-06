import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Material } from "../material/material.model";

export type IMaterialNickname = { materialId: string; nickname?: string | null };

@Table({ tableName: "materials_nicknames", timestamps: false })
export class MaterialNickname extends Model<IMaterialNickname> {
  @PrimaryKey
  @ForeignKey(() => Material)
  @Column({ field: "material_id", type: DataType.STRING(18) })
  declare materialId: string;

  @Column(DataType.STRING(50))
  declare nickname: string | null;

  @BelongsTo(() => Material)
  declare material?: Material;
}
