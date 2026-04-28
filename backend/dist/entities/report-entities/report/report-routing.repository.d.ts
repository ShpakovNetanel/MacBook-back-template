import { Transaction } from "sequelize";
import { Report } from "./report.model";
export declare class ReportRoutingRepository {
    private readonly reportModel;
    constructor(reportModel: typeof Report);
    rerouteUnitReportsToParentForDate(unitId: number, date: string, recipientUnitId: number | null, reporterUnitId: number | null, createdBy: string | null, transaction?: Transaction): Promise<[affectedCount: number]>;
}
