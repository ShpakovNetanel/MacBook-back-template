import { Controller, Get, Req } from "@nestjs/common";
import { StandardService } from "./standard.service";
import { StandardResponse } from "./standard.types";

@Controller("/standard")
export class StandardController {
    constructor(private readonly service: StandardService) { }

    @Get("tool-material-ids")
    getToolMaterialIds(@Req() request: Request): Promise<string[]> {
        const unitId = Number(request.headers["unit"]);
        return this.service.getRelevantToolMaterialIds(unitId, request["date"]);
    }

    @Get("")
    getStandard(@Req() request: Request): Promise<StandardResponse> {
        const unitId = Number(request.headers["unit"]);
        return this.service.getStandards(unitId, request["date"]);
    }
}
