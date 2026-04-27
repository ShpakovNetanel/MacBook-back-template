import { Body, Controller, Delete, Post, Put, Query } from "@nestjs/common";
import { StandardTagService } from "./standard-tag.service";
import type { CreateTagDTO, DeleteTagDTO, UpdateTagDTO } from "./standard-tag.types";

@Controller('/tag')
export class StandardTagController {
    constructor(private readonly service: StandardTagService) { }

    @Post('')
    createTag(@Body() createTag: CreateTagDTO) {
        return this.service.createTag(createTag)
    }

    @Put('')
    updateTag(@Body() updateTag: UpdateTagDTO) {
        return this.service.updateTag(updateTag);
    }

    @Delete()
    deleteTag(@Body() deleteTag: DeleteTagDTO) {
        return this.service.deleteTag(deleteTag.id);
    }
}