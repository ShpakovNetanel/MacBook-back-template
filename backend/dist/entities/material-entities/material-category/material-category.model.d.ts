import { Model } from "sequelize-typescript";
import { Material } from "../material/material.model";
import { MainCategory, SecondCategory, SubCategory } from "../categories/categories.model";
export type IMaterialCategory = {
    materialId: string;
    mainCategoryId?: string | null;
    subCategoryId?: string | null;
    secondCategoryId?: string | null;
};
export declare class MaterialCategory extends Model<IMaterialCategory> {
    materialId: string;
    mainCategoryId: string | null;
    subCategoryId: string | null;
    secondCategoryId: string | null;
    material?: Material;
    mainCategory?: MainCategory;
    subCategory?: SubCategory;
    secondCategory?: SecondCategory;
}
