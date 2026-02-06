import { Column, DataType, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { MaterialCategory } from "../material-category/material-category.model";

export type ICategory = { id: string; description?: string | null };

@Table({ tableName: "main_categories", timestamps: false })
export class MainCategory extends Model<ICategory> {
  @PrimaryKey @Column(DataType.STRING(3)) declare id: string
  @Column(DataType.STRING(40)) declare description: string | null;
  @HasMany(() => MaterialCategory) declare materialCategories?: MaterialCategory[];
}

@Table({ tableName: "sub_categories", timestamps: false })
export class SubCategory extends Model<ICategory> {
  @PrimaryKey @Column(DataType.STRING(3)) declare id: string;
  @Column(DataType.STRING(40)) declare description: string | null;
  @HasMany(() => MaterialCategory) declare materialCategories?: MaterialCategory[];
}

@Table({ tableName: "second_categories", timestamps: false })
export class SecondCategory extends Model<ICategory> {
  @PrimaryKey @Column(DataType.STRING(3)) declare id: string;
  @Column(DataType.STRING(40)) declare description: string | null;
  @HasMany(() => MaterialCategory) declare materialCategories?: MaterialCategory[];
}