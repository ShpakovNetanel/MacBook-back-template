import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UnitUser } from "./unit-user.model";
import { UnitUserRepository } from "./unit-user.repository";

@Module({
    imports: [SequelizeModule.forFeature([UnitUser])],
    providers: [UnitUserRepository],
    exports: [UnitUserRepository]
})

export class UnitUserModule { }