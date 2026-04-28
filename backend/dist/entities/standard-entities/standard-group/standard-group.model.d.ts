import { Model } from "sequelize-typescript";
import { MaterialNickname } from "../../material-entities/material-nickname/material-nickname.model";
import { CategoryGroup } from "../category-group/category-group.model";
type IStandardGroup = {
    id: string;
    name: string;
    groupType: string;
};
export declare class StandardGroup extends Model<IStandardGroup> {
    id: string;
    name: string;
    groupType: string;
    nickname?: MaterialNickname;
    categoryGroup?: CategoryGroup;
}
export {};
