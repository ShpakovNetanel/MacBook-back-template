import { Model } from "sequelize-typescript";
import { UnitId } from "../../unit-entities/unit-id/unit-id.model";
import { ReportItem } from "../report-item/report-item.model";
export type IReport = {
    id?: number;
    reportTypeId: number;
    unitId: number;
    recipientUnitId: number | null;
    reporterUnitId?: number | null;
    createdOn?: Date | null;
    createdAt?: string | null;
    createdBy: string | null;
};
export declare class Report extends Model<IReport> {
    id: number;
    reportTypeId: number;
    unitId: number;
    recipientUnitId: number | null;
    reporterUnitId: number | null;
    createdOn: Date | null;
    createdAt: string | null;
    createdBy: string | null;
    unit?: UnitId;
    recipientUnit?: UnitId;
    reporterUnit?: UnitId;
    items?: ReportItem[];
}
