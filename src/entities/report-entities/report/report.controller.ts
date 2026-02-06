import { Body, Controller, Get, Post } from "@nestjs/common";
import type { SaveReports } from "./report.types";
import { ReportService } from "./report.service";

@Controller('/reports')
export class ReportController {
    constructor(private readonly service: ReportService) {}

    @Get('')
    fetchReports() {
        return;
    }

    @Post('')
    saveReports(@Body() body: SaveReports) {
        return this.service.saveReports()
    }
}