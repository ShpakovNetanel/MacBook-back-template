import { Model } from "sequelize-typescript";
import { MaterialCategory } from "../material-category/material-category.model";
export type ICategory = {
    id: string;
    description?: string | null;
};
export declare class MainCategory extends Model<ICategory> {
    id: string;
    description: string | null;
    materialCategories?: MaterialCategory[];
}
export declare class SubCategory extends Model<ICategory> {
    id: string;
    description: string | null;
    materialCategories?: MaterialCategory[];
}
export declare class SecondCategory extends Model<ICategory> {
    id: string;
    description: string | null;
    materialCategories?: MaterialCategory[];
}
