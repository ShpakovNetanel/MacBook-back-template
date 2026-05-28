import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UnitStatus } from "./units-statuses.model";
import { UnitStatusController } from "./units-statuses.controller";
import { UnitStatusService } from "./units-statuses.service";
import { UnitStatusRepository } from "./units-statuses.repository";
import { UnitRelation } from "../unit-relations/unit-relation.model";
import { Unit } from "../unit/unit.model";
import { Report } from "../../report-entities/report/report.model";
import { ReportItem } from "../../report-entities/report-item/report-item.model";

@Module({
    imports: [SequelizeModule.forFeature([UnitStatus, UnitRelation, Unit, Report, ReportItem])],
    controllers: [UnitStatusController],
    providers: [UnitStatusService, UnitStatusRepository],
    exports: [UnitStatusService, UnitStatusRepository]
})

export class UnitStatusModule { }
