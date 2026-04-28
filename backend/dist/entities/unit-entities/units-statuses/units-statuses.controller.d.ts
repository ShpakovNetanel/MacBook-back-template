import { UnitStatusService } from "./units-statuses.service";
import { UpdateUnitStatus } from "./DTO/updateUnitStatus";
export declare class UnitStatusController {
    private readonly service;
    constructor(service: UnitStatusService);
    updateHierarchyStatuses(unitsStatuses: UpdateUnitStatus, request: any): Promise<number | undefined>;
}
