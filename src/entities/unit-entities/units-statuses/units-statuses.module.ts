import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UnitStatusTypes } from "./units-statuses.model";
import { UnitStatusTypesController } from "./units-statuses.controller";
import { UnitStatusTypesService } from "./units-statuses.service";
import { UnitStatusTypesRepository } from "./units-statuses.repository";
import { UnitRelation } from "../unit-relations/unit-relation.model";

@Module({
    imports: [SequelizeModule.forFeature([UnitStatusTypes, UnitRelation])],
    controllers: [UnitStatusTypesController],
    providers: [UnitStatusTypesService, UnitStatusTypesRepository]
})

export class UnitStatusTypesModule { }
