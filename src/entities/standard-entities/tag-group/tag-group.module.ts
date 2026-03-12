import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { TagGroup } from "./tag-group.model";
import { TagGroupController } from "./tag-group.controller";
import { TagGroupRepository } from "./tag-group.repository";
import { TagGroupService } from "./tag-group.service";
import { StandardTag } from "../standard-tag/standard-tag.model";

@Module({
    imports: [SequelizeModule.forFeature([TagGroup, StandardTag])],
    controllers: [TagGroupController],
    providers: [TagGroupService, TagGroupRepository],
})

export class TagGroupModule { }
