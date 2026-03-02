import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import type { AggregateReportsDTO, ReportDto, SaveReportsBody } from "./report.types";
import { ReportService } from "./report.service";

@Controller('/reports')
export class ReportController {
    constructor(private readonly service: ReportService) { }

    @Get('')
    fetchReports(@Req() request: Request): Promise<ReportDto[]> {
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
            new Date(request['date']),
            Number(request.headers['unit']),
            request['username'],
        )
    }

    @Post('aggregateHierarchy')
    aggregateHierarchy(
        @Body() aggregatedReportsDTO: AggregateReportsDTO,
        @Req() request: Request
    ) {
        return this.service.aggregateHierarchy(
            request['date'],
            Number(request.headers['unit']),
            request['username'],
            aggregatedReportsDTO,
        );
    }
}
