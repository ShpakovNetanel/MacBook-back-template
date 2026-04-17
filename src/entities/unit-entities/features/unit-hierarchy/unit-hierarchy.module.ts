import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ReportRoutingRepository } from "../../../report-entities/report/report-routing.repository";
import { Report } from "../../../report-entities/report/report.model";
import { UnitId } from "../../unit-id/unit-id.model";
import { UnitRelation } from "../../unit-relations/unit-relation.model";
import { UnitStatusType } from "../../unit-status-type/unit-status-type.model";
import { Unit } from "../../unit/unit.model";
import { UnitStatus } from "../../units-statuses/units-statuses.model";
import { UnitStatusRepository } from "../../units-statuses/units-statuses.repository";
import { UnitHierarchyController } from "./unit-hierarchy.controller";
import { UnitHierarchyRepository } from "./unit-hierarchy.repository";
import { UnitHierarchyService } from "./unit-hierarchy.service";
import { UnitUserModule } from "../../users/user.module";

@Module({
  imports: [
    SequelizeModule.forFeature([
      UnitId,
      Unit,
      UnitRelation,
      UnitStatusType,
      UnitStatus,
      Report,
    ]),
    UnitUserModule
  ],
  controllers: [UnitHierarchyController],
  providers: [
    UnitHierarchyService,
    UnitHierarchyRepository,
    UnitStatusRepository,
    ReportRoutingRepository
  ],
  exports: [UnitHierarchyService, UnitHierarchyRepository]
})
export class UnitHierarchyModule { }
