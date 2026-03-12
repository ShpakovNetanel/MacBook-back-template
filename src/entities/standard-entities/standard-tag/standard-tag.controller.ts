import { Body, Controller, Post } from "@nestjs/common";
import { StandardTagService } from "./standard-tag.service";
import type { CreateTagDTO } from "./standard-tag.types";

@Controller('/tag')
export class StandardTagController {
    constructor(private readonly service: StandardTagService) { }

    @Post('')
    createTag(@Body() createTag: CreateTagDTO) {
        return this.service.createTag(createTag)
    }
}