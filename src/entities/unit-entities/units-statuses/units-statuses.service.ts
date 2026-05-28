import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/sequelize";
import { Transaction } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { UnitStatusRepository } from "./units-statuses.repository";
import { UpdateUnitStatus } from "./DTO/updateUnitStatus";
import { UNIT_STATUSES } from "../../../constants";

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
            const result = await this.updateHierarchyStatusesInTransaction(unitsStatuses, date, transaction);
            await transaction.commit();

            return result;
        } catch (error) {
            console.log(error);
            await transaction.rollback();

            throw error;
        }
    }

    async updateHierarchyStatusesInTransaction(
        unitsStatuses: UpdateUnitStatus,
        date: string,
        transaction: Transaction,
    ) {
        const hierarchyUnitIds = await this.repository.fetchHierarchyUnitIds(date, unitsStatuses.unitsIds, transaction);
        const targetUnitIds = unitsStatuses.updateHierarchy
            ? hierarchyUnitIds
            : unitsStatuses.unitsIds;

        if (unitsStatuses.statusId === UNIT_STATUSES.REQUESTING) {
            const reportUnitIds = await this.repository.fetchNonGdudUnitIds(date, targetUnitIds, transaction);
            await this.repository.deleteUsageInventoryReportsForUnitsDate(reportUnitIds, date, transaction);
        }

        if (unitsStatuses.clearHierarchyStatuses) {
            return this.repository.clearStatusesForUnitsDate(targetUnitIds, date, transaction);
        }

        const statusesToSave = targetUnitIds.map(unitId => ({
            unitId,
            unitStatusId: unitsStatuses.statusId,
            date: new Date(date)
        }));

        await this.repository.updateStatuses(statusesToSave, transaction);
    }
}
