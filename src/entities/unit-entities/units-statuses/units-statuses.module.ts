import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UnitStatusTypes } from "./units-statuses.model";
import { UnitStatusTypesController } from "./units-statuses.controller";
import { UnitStatusTypesService } from "./units-statuses.service";
import { UnitStatusTypesRepository } from "./units-statuses.repository";

@Module({
    imports: [SequelizeModule.forFeature([UnitStatusTypes])],
    controllers: [UnitStatusTypesController],
    providers: [UnitStatusTypesService, UnitStatusTypesRepository]
})

export class UnitStatusTypesModule { }