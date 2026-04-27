import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "./user.model";
import { UserRepository } from "./user.repository";

@Module({
    imports: [SequelizeModule.forFeature([User])],
    providers: [UserRepository],
    exports: [UserRepository]
})

export class UnitUserModule { }