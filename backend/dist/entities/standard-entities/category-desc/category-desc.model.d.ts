import { Model } from "sequelize-typescript";
import { CategoryGroup } from "../category-group/category-group.model";
type ICategoryDesc = {
    id: string;
    description: string;
    categoryType: string;
    isAgainstTool: boolean;
};
export declare class CategoryDesc extends Model<ICategoryDesc> {
    id: string;
    description: string;
    categoryType: string;
    isAgainstTool: boolean;
    categoryGroups?: CategoryGroup[];
}
export {};
