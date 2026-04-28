import { ReportService } from "./report.service";
import type { AggregateReportsDTO, DownloadAllocationsDTO, InventoryCalculationBody, ReportDto, SaveAllocationsDTO, SaveCommitteesBody } from "./report.types";
export declare class ReportController {
    private readonly service;
    constructor(service: ReportService);
    fetchReports(request: Request): Promise<ReportDto[]>;
    fetchFavoriteReports(request: Request): Promise<{
        data: import("./report.types").FavoriteReportDto[];
        message: string;
        type: string;
    }>;
    fetchMostRecentMaterials(request: Request): Promise<{
        data: ReportDto[];
        message: string;
        type: string;
    }>;
    saveReportsChanges(saveReportsBody: SaveCommitteesBody, request: Request): Promise<{
        type: string;
        message: string;
    }>;
    aggregateHierarchy(aggregatedReportsDTO: AggregateReportsDTO, request: Request): Promise<{
        type: string;
        message: string;
    }>;
    saveAllocations(saveAllocationsDTO: SaveAllocationsDTO, request: Request): Promise<{
        type: string;
        message: string;
    }>;
    downloadAllocations(downloadAllocationsDTO: DownloadAllocationsDTO, request: Request): Promise<{
        data: null;
        type: string;
        message: string;
    } | {
        data: {
            allocationDuhExport: import("./report.types").AllocationDuhExportDto | null;
        };
        type: string;
        message: string;
    }>;
    inventoryCalculation(inventoryCalculationBody: InventoryCalculationBody, request: Request): Promise<{
        data: import("./report.types").InventoryCalculationResultDto[];
        message: string;
        type: string;
    }>;
}
