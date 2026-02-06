import { Controller, Get, Query, Req } from "@nestjs/common";
import { MaterialService } from "./material.service";

@Controller('/materials')
export class MaterialController {
    constructor(private readonly service: MaterialService) {}

    @Get('twenty')
    fetchTwenty(@Query('filter') filter: string, @Req() request: Request) {
        return this.service.fetchTwenty(filter, Number(request.headers['unit']));
    }
}
