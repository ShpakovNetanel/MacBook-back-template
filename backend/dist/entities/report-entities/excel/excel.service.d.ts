import { MaterialRepository } from "../../material-entities/material/material.repository";
import { UnitHierarchyRepository } from "../../unit-entities/features/unit-hierarchy/unit-hierarchy.repository";
import { ReportRepository } from "../report/report.repository";
import { ReportService } from "../report/report.service";
import type { ReportDto } from "../report/report.types";
import { ExcelImportBody, ExcelImportFailure } from "./excel.types";
export declare class ExcelService {
    private readonly materialRepository;
    private readonly reportRepository;
    private readonly unitHierarchyRepository;
    private readonly reportService;
    constructor(materialRepository: MaterialRepository, reportRepository: ReportRepository, unitHierarchyRepository: UnitHierarchyRepository, reportService: ReportService);
    downloadTemplate(): Promise<{
        buffer: NonSharedBuffer;
        fileName: string;
        mimeType: string;
    }>;
    exportAllocationDuh(date: string, screenUnitId: number, materialId?: string): Promise<{
        data: null;
        message: string;
        type: string;
    } | {
        data: import("../report/report.types").AllocationDuhExportDto;
        message: string;
        type: string;
    }>;
    importExcelRows(date: string, screenUnitId: number, excelImportBody: ExcelImportBody): Promise<{
        message: string;
        type: string;
        data?: undefined;
    } | {
        data: {
            changes: ReportDto[];
            failures: ExcelImportFailure[];
        };
        message: string;
        type: string;
    }>;
    private combineDuplicateExcelRows;
    private buildMaterialByIdMap;
    private buildImportScope;
    private validateScreenRows;
    private validateExcelRows;
    private buildAffectedMaterialsByReportType;
    private collectDbUnitIds;
    private buildChanges;
    private buildFailure;
    private buildReportFetchLikeChanges;
    private buildMaterialDto;
    private buildUnitDto;
    private buildParentUnitDto;
    private buildReportItemTypeDto;
    private buildResponse;
    private buildExcelDuplicateKey;
    private buildUnitMaterialReportKey;
    private upsertChange;
    private getBaseUnitIdsForReportType;
    private isQuantityInMaterialMultiples;
    private buildHierarchyUnitSnapshotFromRelationSource;
    private upsertUnitSnapshot;
    private sortNumeric;
}
