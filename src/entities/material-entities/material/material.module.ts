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
import { Comment } from "src/entities/report-entities/comment/comment.model";
import { Report } from "src/entities/report-entities/report/report.model";
import { ReportItem } from "src/entities/report-entities/report-item/report-item.model";
import { Stock } from "src/entities/report-entities/stock/stock.model";
import { Unit } from "src/entities/unit-entities/unit/unit.model";
import { UnitDetail } from "src/entities/unit-entities/unit-details/unit-details.model";

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
            SubCategory,
            Unit,
            UnitDetail,
            UnitFavoriteMaterial,
        ]),
    ],
    controllers: [MaterialController],
    providers: [MaterialService, MaterialRepository]
})

export class MaterialModule {}
