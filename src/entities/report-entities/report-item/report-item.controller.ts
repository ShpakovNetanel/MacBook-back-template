import { Body, Controller, Delete, Post, Req } from "@nestjs/common";
import { ReportItemService } from "./report-item.service";
import type { DeleteItemsDTO, EatAllocationDTO } from "./report.types";

@Controller('items')
export class ReportItemController {
    constructor(private readonly service: ReportItemService) { }

    @Post('allocation/eat')
    eatAllocation(@Body() eatAllocation: EatAllocationDTO,
        @Req() request: Request) {
        return this.service.eatAllocation({
            date: request?.['date'],
            materialId: eatAllocation.materialId,
            quantity: eatAllocation.quantity,
            unitId: eatAllocation.unitId,
            screenUnitId: Number(request.headers?.['unit'])
        });
    }

}