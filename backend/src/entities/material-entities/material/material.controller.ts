import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { MaterialService } from "./material.service";
import { PastedMaterialsDto } from "./material.types";

@Controller('/materials')
export class MaterialController {
    constructor(private readonly service: MaterialService) { }

    @Get('excel')
    fetchExcelMaterials() {
        return this.service.fetchExcelMaterials();
    }

    @Get('twenty')
    fetchTwenty(@Query('filter') filter: string, @Req() request: Request,
        @Query('tab') tab: number) {
        return this.service.fetchTwenty(filter, Number(request.headers['unit']), tab);
    }

    @Post('paste')
    pastedMaterials(@Body() pastedMaterials: PastedMaterialsDto,
        @Req() request: Request,
        @Query('tab') tab: number) {
        return this.service.fetchByIds(pastedMaterials, Number(request.headers['unit']), Number(tab));
    }
}
