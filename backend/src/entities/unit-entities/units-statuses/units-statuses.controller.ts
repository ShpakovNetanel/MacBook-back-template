import { Body, Controller, Post, Req } from "@nestjs/common";
import { UnitStatusService } from "./units-statuses.service";
import { UpdateUnitStatus } from "./DTO/updateUnitStatus";

@Controller('statuses')
export class UnitStatusController {
    constructor(private readonly service: UnitStatusService) { }

    @Post('')
    updateHierarchyStatuses(@Body() unitsStatuses: UpdateUnitStatus,
        @Req() request) {
        return this.service.updateHierarchyStatuses(unitsStatuses, request?.['date']);
    }
}