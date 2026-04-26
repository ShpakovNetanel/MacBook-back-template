import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { StandardTagModule } from "../standard-tag/standard-tag.module";
import { UnitStandardTagController } from "./unit-standard-tag.controller";
import { UnitStandardTags } from "./unit-standard-tag.model";
import { UnitStanadrdTagRepository } from "./unit-standard-tag.repository";
import { UnitStandardTagService } from "./unit-standard-tag.service";

@Module({
    imports: [SequelizeModule.forFeature([UnitStandardTags]), StandardTagModule],
    controllers: [UnitStandardTagController],
    providers: [UnitStandardTagService, UnitStanadrdTagRepository],
})

export class UnitStandardTagModule { }
