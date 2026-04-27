import { Body, Controller, Delete, Post } from "@nestjs/common";
import { UnitStandardTagService } from "./unit-standard-tag.service";
import type { CreateUnitStandardTag, DeleteUnitStandardTag } from "./unit-standard-tag.types";

@Controller('unitStandardTag')
export class UnitStandardTagController {
    constructor(private readonly service: UnitStandardTagService) { }

    @Post('')
    createUnitStandardTag(@Body() createUnitStandardTag: CreateUnitStandardTag) {
        return this.service.createUnitStandardTag(createUnitStandardTag)
    }

    @Delete('')
    removeUnitStandardTag(@Body() deleteUnitStandardTag: DeleteUnitStandardTag) {
        return this.service.removeUnitStandardTag(deleteUnitStandardTag);
    }
}