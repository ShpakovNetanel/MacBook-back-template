import { Injectable } from "@nestjs/common";
import { ReportRepository } from "./report.repository";

@Injectable()
export class ReportService {
    constructor(private readonly repository: ReportRepository) {}

    saveReports() {}
}