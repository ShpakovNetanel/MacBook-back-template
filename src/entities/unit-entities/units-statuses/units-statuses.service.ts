import { Injectable } from "@nestjs/common";
import { UnitStatusTypesRepository } from "./units-statuses.repository";
import { UpdateUnitStatus } from "./DTO/updateUnitStatus";

@Injectable()
export class UnitStatusTypesService {
    constructor(private readonly repository: UnitStatusTypesRepository) { }

    async updateHierarchyStatuses(unitsStatuses: UpdateUnitStatus, date: string) {
        try {
            const hierarchyUnitIds = await this.repository.fetchHierarchyUnitIds(date, unitsStatuses.unitsIds);
            const statusesToSave = unitsStatuses.updateHierarchy
                ? hierarchyUnitIds.map(unitId => ({
                    unitId,
                    unitStatusId: unitsStatuses.statusId,
                    date: new Date(date)
                }))
                : unitsStatuses.unitsIds.map(unitId => ({
                    unitId,
                    unitStatusId: unitsStatuses.statusId,
                    date: new Date(date)
                }));

            return this.repository.updateStatuses(statusesToSave);
        } catch (error) {
            console.log(error);
        }
    }
}
