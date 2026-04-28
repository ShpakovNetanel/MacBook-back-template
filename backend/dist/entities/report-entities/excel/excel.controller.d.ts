import { ExcelService } from "./excel.service";
import type { ExcelImportBody } from "./excel.types";
import type { DownloadAllocationsDTO } from "../report/report.types";
import type { Response } from "express";
export declare class ExcelController {
    private readonly service;
    constructor(service: ExcelService);
    downloadTemplate(response: Response): Promise<void>;
    importExcelRows(excelImportBody: ExcelImportBody, request: Request): Promise<{
        message: string;
        type: string;
        data?: undefined;
    } | {
        data: {
            changes: import("../report/report.types").ReportDto[];
            failures: import("./excel.types").ExcelImportFailure[];
        };
        message: string;
        type: string;
    }>;
    exportAllocationDuh(downloadAllocationsDTO: DownloadAllocationsDTO, request: Request): Promise<{
        data: null;
        message: string;
        type: string;
    } | {
        data: import("../report/report.types").AllocationDuhExportDto;
        message: string;
        type: string;
    }>;
}
