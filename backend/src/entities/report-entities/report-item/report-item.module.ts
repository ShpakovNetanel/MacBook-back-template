import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UnitModule } from "src/entities/unit-entities/unit/unit.module";
import { UnitStatusModule } from "src/entities/unit-entities/units-statuses/units-statuses.module";
import { Report } from "../report/report.model";
import { ReportItemController } from "./report-item.controller";
import { ReportItem } from "./report-item.model";
import { ReportItemRepository } from "./report-item.repository";
import { ReportItemService } from "./report-item.service";

@Module({
    imports: [SequelizeModule.forFeature([ReportItem, Report]), UnitModule, UnitStatusModule],
    providers: [ReportItemRepository, ReportItemService],
    controllers: [ReportItemController]
})

export class ReportItemModule { }