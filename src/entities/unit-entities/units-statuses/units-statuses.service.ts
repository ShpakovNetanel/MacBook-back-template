import { Injectable } from "@nestjs/common";
import { UnitStatusTypesRepository } from "./units-statuses.repository";
import { UpdateUnitStatus } from "./DTO/updateUnitStatus";

@Injectable()
export class UnitStatusTypesService {
    constructor(private readonly repository: UnitStatusTypesRepository) { }

    updateStatuses(unitsStatuses: UpdateUnitStatus, date: string) {
        try {
            return this.repository.updateStatuses(unitsStatuses.unitsIds.map(unitId => ({
                unitId,
                unitStatusId: unitsStatuses.statusId,
                date: new Date(date)
            })));
        } catch (error) {
            console.log(error);
        }
    }
}