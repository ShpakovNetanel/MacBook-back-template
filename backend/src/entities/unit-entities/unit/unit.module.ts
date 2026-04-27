import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Unit } from "./unit.model";
import { UnitRepository } from "./unit.repository";

@Module({
    imports: [SequelizeModule.forFeature([Unit])],
    providers: [UnitRepository],
    exports: [UnitRepository]
})
export class UnitModule { }
