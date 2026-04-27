import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { UnitStatusRepository } from "./units-statuses.repository";
import { UpdateUnitStatus } from "./DTO/updateUnitStatus";
import { NotificationService } from "../../../notifications/notification.service";
import { UNIT_STATUSES } from "../../../constants";

@Injectable()
export class UnitStatusService {
    constructor(private readonly repository: UnitStatusRepository,
        @InjectConnection()
        private readonly sequelize: Sequelize,
        private readonly notificationService: NotificationService,
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
                const currentStatuses = await this.repository.fetchStatusesForUnits(unitsStatuses.unitsIds, date);
                const unitsWithStatus = unitsStatuses.unitsIds.filter(id => currentStatuses.has(id));

                const result = await this.repository.clearStatusesForUnitsDate(targetUnitIds, date, transaction);
                await transaction.commit();

                for (const unitId of unitsWithStatus) {
                    this.notificationService.notifyUnitUsers(
                        unitId,
                        'פתיחה',
                        `אפשרות דיווח נפתחה עבורך במערכת דרישות והקצאות`,
                    ).catch(() => {});
                }

                return result;
            }

            const currentStatuses = await this.repository.fetchStatusesForUnits(unitsStatuses.unitsIds, date);
            const unitsActuallyChanged = unitsStatuses.unitsIds.filter(id => {
                const current = currentStatuses.get(id);
                return current === undefined || current !== unitsStatuses.statusId;
            });

            const statusesToSave = targetUnitIds.map(unitId => ({
                unitId,
                unitStatusId: unitsStatuses.statusId,
                date: new Date(date)
            }));

            await this.repository.updateStatuses(statusesToSave, transaction);
            await transaction.commit();

            const isLocking = unitsStatuses.statusId !== UNIT_STATUSES.REQUESTING;
            for (const unitId of unitsActuallyChanged) {
                this.notificationService.notifyUnitUsers(
                    unitId,
                    isLocking ? 'נעילה' : 'פתיחה',
                    isLocking
                        ? `הדיווחים נעולים עבור יחידתך במערכת דרישות והקצאות`
                        : `אפשרות דיווח נפתחה עבורך במערכת דרישות והקצאות`,
                ).catch(() => {});
            }
        } catch (error) {
            console.log(error);
            await transaction.rollback();
        }
    }
}
