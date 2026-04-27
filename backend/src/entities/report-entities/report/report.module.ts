import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { MainCategory } from "../../material-entities/categories/categories.model";
import { MaterialCategory } from "../../material-entities/material-category/material-category.model";
import { MaterialNickname } from "../../material-entities/material-nickname/material-nickname.model";
import { Material } from "../../material-entities/material/material.model";
import { UnitFavoriteMaterial } from "../../material-entities/unit-favorite-material/unit-favorite-material.model";
import { MaterialStandardGroup } from "../../standard-entities/material-standard-group/material-standard-group.model";
import { CategoryDesc } from "../../standard-entities/category-desc/category-desc.model";
import { CategoryGroup } from "../../standard-entities/category-group/category-group.model";
import { StandardGroup } from "../../standard-entities/standard-group/standard-group.model";
import { UnitHierarchyModule } from "../../unit-entities/features/unit-hierarchy/unit-hierarchy.module";
import { UnitRelation } from "../../unit-entities/unit-relations/unit-relation.model";
import { UnitStatusType } from "../../unit-entities/unit-status-type/unit-status-type.model";
import { UnitModule } from "../../unit-entities/unit/unit.module";
import { Unit } from "../../unit-entities/unit/unit.model";
import { UnitStatus } from "../../unit-entities/units-statuses/units-statuses.model";
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
        MaterialStandardGroup,
        CategoryDesc,
        CategoryGroup,
        StandardGroup,
        UnitFavoriteMaterial,
        Comment,
        Stock
    ]),
        UnitHierarchyModule,
        UnitModule],
    controllers: [ReportController],
    providers: [ReportService, ReportRepository],
    exports: [ReportService, ReportRepository],
})

export class ReportModule { }
