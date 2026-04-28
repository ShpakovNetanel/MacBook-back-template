import { Model } from "sequelize-typescript";
import { CategoryDesc } from "../category-desc/category-desc.model";
type ICategoryGroup = {
    id: string;
    groupId: string;
};
export declare class CategoryGroup extends Model<ICategoryGroup> {
    id: string;
    groupId: string;
    categoryDesc?: CategoryDesc;
}
export {};
