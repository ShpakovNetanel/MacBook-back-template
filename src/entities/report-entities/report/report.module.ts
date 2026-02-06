import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Report } from "./report.model";
import { ReportController } from "./report.controller";
import { ReportService } from "./report.service";
import { ReportRepository } from "./report.repository";
import { ReportItem } from "../report-item/report-item.model";
import { UnitDetail } from "src/entities/unit-entities/unit-details/unit-details.model";
import { UnitRelation } from "src/entities/unit-entities/unit-relations/unit-relation.model";
import { UnitStatusTypes } from "src/entities/unit-entities/units-statuses/units-statuses.model";
import { UnitStatusType } from "src/entities/unit-entities/unit-status-type/unit-status-type.model";
import { Material } from "src/entities/material-entities/material/material.model";
import { MaterialNickname } from "src/entities/material-entities/material-nickname/material-nickname.model";
import { MaterialCategory } from "src/entities/material-entities/material-category/material-category.model";
import { MainCategory } from "src/entities/material-entities/categories/categories.model";
import { UnitFavoriteMaterial } from "src/entities/material-entities/unit-favorite-material/unit-favorite-material.model";
import { Comment } from "../comment/comment.model";
import { Stock } from "../stock/stock.model";

@Module({
    imports: [SequelizeModule.forFeature([
        Report,
        ReportItem,
        UnitDetail,
        UnitRelation,
        UnitStatusTypes,
        UnitStatusType,
        Material,
        MaterialNickname,
        MaterialCategory,
        MainCategory,
        UnitFavoriteMaterial,
        Comment,
        Stock
    ])],
    controllers: [ReportController],
    providers: [ReportService, ReportRepository]
})

export class ReportModule { }
