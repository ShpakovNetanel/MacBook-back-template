import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { UnitStatusRepository } from "./units-statuses.repository";
import { UpdateUnitStatus } from "./DTO/updateUnitStatus";

@Injectable()
export class UnitStatusService {
    constructor(private readonly repository: UnitStatusRepository,
        @InjectConnection()
        private readonly sequelize: Sequelize
    ) { }

    async updateHierarchyStatuses(
        unitsStatuses: UpdateUnitStatus,
        date: string,
    ) {
        const transaction = await this.sequelize.transaction();

        try {
            const hierarchyUnitIds = await this.repository.fetchHierarchyUnitIds(date, unitsStatuses.unitsIds);
            const targetUnitIds = unitsStatuses.updateHierarchy
                ? hierarchyUnitIds
                : unitsStatuses.unitsIds;

            if (unitsStatuses.clearHierarchyStatuses) {
                return this.repository.clearStatusesForUnitsDate(targetUnitIds, date, transaction);
            }

            const statusesToSave = targetUnitIds.map(unitId => ({
                unitId,
                unitStatusId: unitsStatuses.statusId,
                date: new Date(date)
            }));

            await this.repository.updateStatuses(statusesToSave, transaction);
            await transaction.commit();
        } catch (error) {
            console.log(error);
            await transaction.rollback();
        }
    }
}
