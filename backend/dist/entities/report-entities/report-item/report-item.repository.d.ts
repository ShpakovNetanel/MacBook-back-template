import { Transaction } from "sequelize";
import { Report } from "../report/report.model";
import { IReportItem, ReportItem } from "./report-item.model";
import { ReportItemKey } from "./report.types";
export declare class ReportItemRepository {
    private readonly reportModel;
    private readonly reportItemModel;
    constructor(reportModel: typeof Report, reportItemModel: typeof ReportItem);
    fetchReports(reportItemKey: ReportItemKey): Promise<Report[]>;
    updateReportsItems(reportsItems: IReportItem[], transaction: Transaction): Promise<ReportItem[]>;
}
