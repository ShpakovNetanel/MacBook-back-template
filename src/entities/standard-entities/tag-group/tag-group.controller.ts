import { Body, Controller, Get, Post } from "@nestjs/common";
import type { CreateTagGroupDTO } from "./tag-group.types";
import { TagGroupService } from "./tag-group.service";

@Controller('/tagGroup')
export class TagGroupController {
    constructor(private readonly service: TagGroupService) { }

    @Get('')
    fetchAll() {
        return this.service.fetchAll();
    }

    @Post('')
    createTag(@Body() createTagGroupDTO: CreateTagGroupDTO) {
        return this.service.createTagGroup(createTagGroupDTO);
    }
}