import { ReportItemService } from "./report-item.service";
import type { EatAllocationDTO } from "./report.types";
export declare class ReportItemController {
    private readonly service;
    constructor(service: ReportItemService);
    eatAllocation(eatAllocation: EatAllocationDTO, request: Request): Promise<{
        message: string;
        type: string;
    }>;
}
