import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { MaterialService } from "./material.service";
import { PastedMaterialsDto } from "./material.types";

@Controller('/materials')
export class MaterialController {
    constructor(private readonly service: MaterialService) { }

    @Get('twenty')
    fetchTwenty(@Query('filter') filter: string, @Req() request: Request) {
        return this.service.fetchTwenty(filter, Number(request.headers['unit']));
    }

    @Post('paste')
    pastedMaterials(@Body() pastedMaterials: PastedMaterialsDto,
        @Req() request: Request) {
        return this.service.fetchByIds(pastedMaterials, Number(request.headers['unit']));
    }
}