import { Model } from "sequelize-typescript";
import { Comment } from "../../report-entities/comment/comment.model";
import { ReportItem } from "../../report-entities/report-item/report-item.model";
import { Stock } from "../../report-entities/stock/stock.model";
import { MaterialCategory } from "../material-category/material-category.model";
import { MaterialNickname } from "../material-nickname/material-nickname.model";
import { UnitFavoriteMaterial } from "../unit-favorite-material/unit-favorite-material.model";
export type IMaterial = {
    id: string;
    description?: string | null;
    centerId: number;
    sectionId: number;
    unitOfMeasurement?: string | null;
    multiply?: number | null;
    recordStatus: string;
    type: string;
};
export declare class Material extends Model<IMaterial> {
    id: string;
    description: string | null;
    centerId: number;
    sectionId: number;
    unitOfMeasurement: string | null;
    multiply: string | null;
    recordStatus: string;
    type: string;
    materialCategory?: MaterialCategory;
    unitFavorites?: UnitFavoriteMaterial[];
    stocks?: Stock[];
    comments?: Comment[];
    nickname?: MaterialNickname;
    reportItems?: ReportItem[];
}
