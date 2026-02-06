import {
  BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table
} from "sequelize-typescript";
import { Material } from "../material/material.model";
import { MainCategory, SecondCategory, SubCategory } from "../categories/categories.model";

export type IMaterialCategory = {
  materialId: string;
  mainCategoryId?: string | null;
  subCategoryId?: string | null;
  secondCategoryId?: string | null;
};

@Table({ tableName: "material_categories", timestamps: false })
export class MaterialCategory extends Model<IMaterialCategory> {
  @PrimaryKey
  @ForeignKey(() => Material)
  @Column({ field: "material_id", type: DataType.STRING(18) })
  declare materialId: string;

  @ForeignKey(() => MainCategory)
  @Column({ field: "main_category", type: DataType.STRING(3) })
  declare mainCategoryId: string | null;

  @ForeignKey(() => SubCategory)
  @Column({ field: "sub_category", type: DataType.STRING(3) })
  declare subCategoryId: string | null;

  @ForeignKey(() => SecondCategory)
  @Column({ field: "second_category", type: DataType.STRING(3) })
  declare secondCategoryId: string | null;

  @BelongsTo(() => Material)
  declare material?: Material;

  @BelongsTo(() => MainCategory)
  declare mainCategory?: MainCategory;

  @BelongsTo(() => SubCategory)
  declare subCategory?: SubCategory;

  @BelongsTo(() => SecondCategory)
  declare secondCategory?: SecondCategory;
}
