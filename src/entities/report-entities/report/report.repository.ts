import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Report } from "./report.model";
import { ReportItem } from "../report-item/report-item.model";

@Injectable()
export class ReportRepository {
    constructor(@InjectModel(Report) private readonly reportModel: typeof Report,
        @InjectModel(ReportItem) private readonly reportItemModel: typeof ReportItem) { }

    saveReports({reportsToSave, transaction}) { 

    }
}