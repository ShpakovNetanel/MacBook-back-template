import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UnitStatus } from "./units-statuses.model";
import { UnitStatusController } from "./units-statuses.controller";
import { UnitStatusService } from "./units-statuses.service";
import { UnitStatusRepository } from "./units-statuses.repository";
import { UnitRelation } from "../unit-relations/unit-relation.model";

@Module({
    imports: [SequelizeModule.forFeature([UnitStatus, UnitRelation])],
    controllers: [UnitStatusController],
    providers: [UnitStatusService, UnitStatusRepository],
    exports: [UnitStatusService, UnitStatusRepository]
})

export class UnitStatusModule { }
