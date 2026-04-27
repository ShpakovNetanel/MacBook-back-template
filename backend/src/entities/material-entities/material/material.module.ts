import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { MaterialController } from "./material.controller";
import { MaterialService } from "./material.service";
import { MaterialRepository } from "./material.repository";
import { Material } from "./material.model";
import { MaterialCategory } from "../material-category/material-category.model";
import { MaterialNickname } from "../material-nickname/material-nickname.model";
import { UnitFavoriteMaterial } from "../unit-favorite-material/unit-favorite-material.model";
import { MainCategory, SecondCategory, SubCategory } from "../categories/categories.model";
import { Comment } from "../../report-entities/comment/comment.model";
import { Report } from "../../report-entities/report/report.model";
import { ReportItem } from "../../report-entities/report-item/report-item.model";
import { Stock } from "../../report-entities/stock/stock.model";
import { CategoryDesc } from "../../standard-entities/category-desc/category-desc.model";
import { CategoryGroup } from "../../standard-entities/category-group/category-group.model";
import { StandardGroup } from "../../standard-entities/standard-group/standard-group.model";
import { UnitId } from "../../unit-entities/unit-id/unit-id.model";
import { Unit } from "../../unit-entities/unit/unit.model";

@Module({
    imports: [
        SequelizeModule.forFeature([
            Comment,
            MainCategory,
            Material,
            MaterialCategory,
            MaterialNickname,
            Report,
            ReportItem,
            SecondCategory,
            Stock,
            CategoryDesc,
            CategoryGroup,
            StandardGroup,
            SubCategory,
            UnitId,
            Unit,
            UnitFavoriteMaterial,
        ]),
    ],
    controllers: [MaterialController],
    providers: [MaterialService, MaterialRepository],
    exports: [MaterialRepository]
})

export class MaterialModule { }
