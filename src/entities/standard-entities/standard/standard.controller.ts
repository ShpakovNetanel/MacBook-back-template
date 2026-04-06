import { Controller, Get, Req } from "@nestjs/common";
import { StandardService } from "./standard.service";
import { StandardDrawerDataDto } from "./standard.types";

@Controller("/standard")
export class StandardController {
    constructor(private readonly service: StandardService) { }

    @Get("")
    getStandard(@Req() request: Request): Promise<StandardDrawerDataDto[]> {
        const unitId = Number(request.headers["unit"]);
        const reqDate = request["date"];
        console.log(`[StandardController] Received request for unit: ${unitId} (raw: ${request.headers["unit"]}), date: ${reqDate} (raw: ${request.headers["screendate"]})`);

        return this.service.getStandardDrawerData(
            unitId,
            reqDate,
        );
    }
}
