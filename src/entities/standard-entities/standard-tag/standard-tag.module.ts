import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { StandardTag } from "./standard-tag.model";
import { StandardTagController } from "./standard-tag.controller";
import { StandardTagService } from "./standard-tag.service";
import { StandardTagRepository } from "./standard-tag.repository";

@Module({
    imports: [SequelizeModule.forFeature([StandardTag])],
    controllers: [StandardTagController],
    providers: [StandardTagService, StandardTagRepository]
})

export class StandardTagModule { }