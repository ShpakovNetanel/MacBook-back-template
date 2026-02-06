import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Report } from "./report.model";
import { ReportController } from "./report.controller";
import { ReportService } from "./report.service";
import { ReportRepository } from "./report.repository";
import { ReportItem } from "../report-item/report-item.model";

@Module({
    imports: [SequelizeModule.forFeature([Report, ReportItem])],
    controllers: [ReportController],
    providers: [ReportService, ReportRepository]
})

export class ReportModule { }