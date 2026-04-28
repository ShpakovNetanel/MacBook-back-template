import type { Report } from "../report.model";
import type { FavoriteReportDto, MaterialDto, ReportDto } from "../report.types";
import { UnitRelation } from "../../../unit-entities/unit-relations/unit-relation.model";
type FetchReportsParams = {
    recipientUnitId: number;
    reports: Report[] | null | undefined;
    yesterdayInventoryReports?: Report[] | null | undefined;
    screenAllocationReports?: Report[] | null | undefined;
    fetchQuantity?: boolean;
};
export declare const buildReportsResponse: ({ recipientUnitId, reports, yesterdayInventoryReports, screenAllocationReports, fetchQuantity }: FetchReportsParams) => ReportDto[];
export declare const buildReportsMaterialsResponse: (params: FetchReportsParams) => ReportDto[];
export declare const buildFavoriteReportsResponse: (materials: MaterialDto[] | null | undefined, childrenUnits: UnitRelation[], reportTypeIds: number[], yesterdayInventoryReports?: Report[] | null | undefined) => FavoriteReportDto[];
export {};
