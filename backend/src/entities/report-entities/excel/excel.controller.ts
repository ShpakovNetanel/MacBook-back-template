import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { ExcelService } from "./excel.service";
import type { ExcelImportBody } from "./excel.types";
import type { DownloadAllocationsDTO } from "../report/report.types";
import type { Response } from "express";

@Controller("/excel")
export class ExcelController {
    constructor(private readonly service: ExcelService) { }

    @Get("template")
    async downloadTemplate(@Res() response: Response) {
        const template = await this.service.downloadTemplate();

        response.setHeader("Content-Type", template.mimeType);
        response.setHeader("Content-Disposition", `attachment; filename="${template.fileName}"`);
        response.send(template.buffer);
    }

    @Post("upload")
    importExcelRows(
        @Body() excelImportBody: ExcelImportBody,
        @Req() request: Request
    ) {
        return this.service.importExcelRows(
            request["date"],
            Number(request.headers["unit"]),
            excelImportBody,
        );
    }

    @Post("allocationDuh")
    exportAllocationDuh(
        @Body() downloadAllocationsDTO: DownloadAllocationsDTO,
        @Req() request: Request,
    ) {
        return this.service.exportAllocationDuh(
            request["date"],
            Number(request.headers["unit"]),
            downloadAllocationsDTO?.materialId,
        );
    }
}
