import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import type { SaveReportsBody } from "./report.types";
import { ReportService } from "./report.service";

@Controller('/reports')
export class ReportController {
    constructor(private readonly service: ReportService) { }

    @Get('')
    fetchReports(@Req() request: Request): Promise<unknown> {
        return this.service.fetchReports(
            request['date'],
            Number(request.headers['unit'])
        );
    }

    @Post('saveChanges')
    saveReportsChanges(@Body() saveReportsBody: SaveReportsBody,
        @Req() request: Request) {
        return this.service.saveReportsChanges(
            saveReportsBody,
            request['date'],
            Number(request.headers['unit']),
            request['username'],
        )
    }
}
