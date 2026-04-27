import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { StandardValues } from "./standard-values.model";
import { StandardValuesRepository } from "./standard-values.repository";

@Module({
    imports: [SequelizeModule.forFeature([StandardValues])],
    providers: [StandardValuesRepository],
    exports: [StandardValuesRepository]
})

export class StandardValuesModule { }