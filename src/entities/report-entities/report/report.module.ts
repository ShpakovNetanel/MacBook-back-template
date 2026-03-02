import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { MainCategory } from "src/entities/material-entities/categories/categories.model";
import { MaterialCategory } from "src/entities/material-entities/material-category/material-category.model";
import { MaterialNickname } from "src/entities/material-entities/material-nickname/material-nickname.model";
import { Material } from "src/entities/material-entities/material/material.model";
import { UnitFavoriteMaterial } from "src/entities/material-entities/unit-favorite-material/unit-favorite-material.model";
import { UnitHierarchyModule } from "src/entities/unit-entities/features/unit-hierarchy/unit-hierarchy.module";
import { UnitRelation } from "src/entities/unit-entities/unit-relations/unit-relation.model";
import { UnitStatusType } from "src/entities/unit-entities/unit-status-type/unit-status-type.model";
import { Unit } from "src/entities/unit-entities/unit/unit.model";
import { UnitStatus } from "src/entities/unit-entities/units-statuses/units-statuses.model";
import { Comment } from "../comment/comment.model";
import { ReportItem } from "../report-item/report-item.model";
import { Stock } from "../stock/stock.model";
import { ReportController } from "./report.controller";
import { Report } from "./report.model";
import { ReportRepository } from "./report.repository";
import { ReportService } from "./report.service";

@Module({
    imports: [SequelizeModule.forFeature([
        Report,
        ReportItem,
        Unit,
        UnitRelation,
        UnitStatus,
        UnitStatusType,
        Material,
        MaterialNickname,
        MaterialCategory,
        MainCategory,
        UnitFavoriteMaterial,
        Comment,
        Stock
    ]),
        UnitHierarchyModule],
    controllers: [ReportController],
    providers: [ReportService, ReportRepository],
    exports: [ReportService, ReportRepository],
})

export class ReportModule { }
