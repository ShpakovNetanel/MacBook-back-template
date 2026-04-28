import { Model } from "sequelize-typescript";
import { Material } from "../../material-entities/material/material.model";
import { StandardGroup } from "../../standard-entities/standard-group/standard-group.model";
import { UnitId } from "../../unit-entities/unit-id/unit-id.model";
import { Report } from "../report/report.model";
export type IReportItem = {
    reportId: number;
    materialId: string;
    reportingLevel: number;
    reportingUnitId: number;
    reportedQuantity?: number | null;
    confirmedQuantity?: number | null;
    balanceQuantity?: number | null;
    status?: string | null;
    changedAt?: string | null;
    changedBy?: string | null;
    modifiedAt?: Date | null;
};
export declare class ReportItem extends Model<IReportItem> {
    reportId: number;
    materialId: string;
    reportingLevel: number;
    reportingUnitId: number;
    reportedQuantity: string | null;
    confirmedQuantity: string | null;
    balanceQuantity: string | null;
    status: string | null;
    changedAt: string | null;
    changedBy: string | null;
    modifiedAt: Date | null;
    report?: Report;
    material?: Material;
    standardGroup?: StandardGroup;
    reportingUnit?: UnitId;
}
