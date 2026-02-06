import { Body, Controller, Post, Req } from "@nestjs/common";
import { UnitStatusTypesService } from "./units-statuses.service";
import { UpdateUnitStatus } from "./DTO/updateUnitStatus";

@Controller('statuses')
export class UnitStatusTypesController {
    constructor(private readonly service: UnitStatusTypesService) { }

    @Post('')
    updateStatuses(@Body() unitsStatuses: UpdateUnitStatus,
        @Req() request) {
        return this.service.updateStatuses(unitsStatuses, request?.['date']);
    }
}