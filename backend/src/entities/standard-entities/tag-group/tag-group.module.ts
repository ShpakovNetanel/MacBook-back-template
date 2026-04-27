import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { StandardTag } from "../standard-tag/standard-tag.model";
import { StandardValuesModule } from "../standard-values/standard-values.module";
import { TagGroupController } from "./tag-group.controller";
import { TagGroup } from "./tag-group.model";
import { TagGroupRepository } from "./tag-group.repository";
import { TagGroupService } from "./tag-group.service";

@Module({
    imports: [SequelizeModule.forFeature([TagGroup, StandardTag]), StandardValuesModule],
    controllers: [TagGroupController],
    providers: [TagGroupService, TagGroupRepository],
})

export class TagGroupModule { }
