import { BadRequestException, Injectable } from "@nestjs/common";
import { ReportItemRepository } from "./report-item.repository";
import { MESSAGE_TYPES, RECORD_STATUS, REPORT_TYPES, UNIT_LEVELS, UNIT_STATUSES } from "../../../constants";
import { IReportItem } from "./report-item.model";
import { Sequelize } from "sequelize-typescript";
import { DeleteItemsDTO, EatAllocationDTO } from "./report.types";
import { isNullish } from "remeda";
import { UnitRepository } from "src/entities/unit-entities/unit/unit.repository";
import { UnitStatusRepository } from "src/entities/unit-entities/units-statuses/units-statuses.repository";

@Injectable()
export class ReportItemService {
    constructor(private readonly repository: ReportItemRepository,
        private readonly unitRepository: UnitRepository,
        private readonly unitStatusRepository: UnitStatusRepository,
        private readonly sequelize: Sequelize
    ) { }

    async eatAllocation(eatAllocation: EatAllocationDTO) {
        const itemsToUpdate: IReportItem[] = [];
        const transaction = await this.sequelize.transaction();

        try {
            const unitDetails = await this.unitRepository.fetchActiveUnitDetails(eatAllocation.date, eatAllocation.screenUnitId);

            const recipientUnitAllocation = await this.repository.fetchReports({
                date: eatAllocation.date,
                materialId: eatAllocation.materialId,
                reportsTypesIds: [REPORT_TYPES.ALLOCATION],
                recipientUnitId: eatAllocation.unitId
            });

            const recipientUnitItem = recipientUnitAllocation?.[0]?.items?.[0]?.dataValues;
            let screenUnitItem: IReportItem | undefined;

            if (unitDetails?.unitLevelId !== UNIT_LEVELS.MATKAL) {
                const screenUnitAllocation = await this.repository.fetchReports({
                    date: eatAllocation.date,
                    materialId: eatAllocation.materialId,
                    reportsTypesIds: [REPORT_TYPES.ALLOCATION],
                    recipientUnitId: eatAllocation.screenUnitId
                });

                screenUnitItem = screenUnitAllocation?.[0]?.items?.[0]?.dataValues;

                if (!isNullish(screenUnitItem)) {
                    screenUnitItem.balanceQuantity! = Number(screenUnitItem.balanceQuantity) + Number(eatAllocation.quantity);

                    itemsToUpdate.push(screenUnitItem);
                }
            }

            if (!isNullish(recipientUnitItem)) {
                recipientUnitItem.balanceQuantity = Number(recipientUnitItem.balanceQuantity) - Number(eatAllocation.quantity);
                recipientUnitItem.confirmedQuantity! = Number(recipientUnitItem.confirmedQuantity) - Number(eatAllocation.quantity);

                if (recipientUnitItem.confirmedQuantity === 0) {
                    await this.unitStatusRepository.updateStatuses([{
                        date: new Date(eatAllocation.date),
                        unitId: eatAllocation.unitId,
                        unitStatusId: UNIT_STATUSES.WAITING_FOR_ALLOCATION
                    }], transaction);
                }

                itemsToUpdate.push(recipientUnitItem);
            }

            await this.repository.updateReportsItems(itemsToUpdate, transaction);

            await transaction.commit();
            return {
                message: 'ההקצאה נאכלה בהצלחה',
                type: MESSAGE_TYPES.SUCCESS
            };
        } catch (error) {
            console.log(error);
            
            await transaction.rollback();
            throw new BadRequestException({
                message: 'נכשלה אכילת ההקצאה, יש לנסות שוב',
                type: MESSAGE_TYPES.FAILURE
            });
        }
    }
}
