import { Controller, Get, Query } from "@nestjs/common";
import { MaterialService } from "./material.service";

@Controller('/materials')
export class MaterialController {
    constructor(private readonly service: MaterialService) {}

    @Get('twenty')
    fetchTwenty(@Query('filter') filter: string) {
        return this.service.fetchTwenty(filter);
    }
}