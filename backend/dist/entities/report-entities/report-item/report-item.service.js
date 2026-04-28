"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportItemService = void 0;
const common_1 = require("@nestjs/common");
const report_item_repository_1 = require("./report-item.repository");
const constants_1 = require("../../../constants");
const sequelize_typescript_1 = require("sequelize-typescript");
const remeda_1 = require("remeda");
const unit_repository_1 = require("../../unit-entities/unit/unit.repository");
const units_statuses_repository_1 = require("../../unit-entities/units-statuses/units-statuses.repository");
let ReportItemService = class ReportItemService {
    repository;
    unitRepository;
    unitStatusRepository;
    sequelize;
    constructor(repository, unitRepository, unitStatusRepository, sequelize) {
        this.repository = repository;
        this.unitRepository = unitRepository;
        this.unitStatusRepository = unitStatusRepository;
        this.sequelize = sequelize;
    }
    async eatAllocation(eatAllocation) {
        const itemsToUpdate = [];
        const transaction = await this.sequelize.transaction();
        try {
            const unitDetails = await this.unitRepository.fetchActiveUnitDetails(eatAllocation.date, eatAllocation.screenUnitId);
            const recipientUnitAllocation = await this.repository.fetchReports({
                date: eatAllocation.date,
                materialId: eatAllocation.materialId,
                reportsTypesIds: [constants_1.REPORT_TYPES.ALLOCATION],
                recipientUnitId: eatAllocation.unitId
            });
            const recipientUnitItem = recipientUnitAllocation?.[0]?.items?.[0]?.dataValues;
            let screenUnitItem;
            if (unitDetails?.unitLevelId !== constants_1.UNIT_LEVELS.MATKAL) {
                const screenUnitAllocation = await this.repository.fetchReports({
                    date: eatAllocation.date,
                    materialId: eatAllocation.materialId,
                    reportsTypesIds: [constants_1.REPORT_TYPES.ALLOCATION],
                    recipientUnitId: eatAllocation.screenUnitId
                });
                screenUnitItem = screenUnitAllocation?.[0]?.items?.[0]?.dataValues;
                if (!(0, remeda_1.isNullish)(screenUnitItem)) {
                    screenUnitItem.balanceQuantity = Number(screenUnitItem.balanceQuantity) + Number(eatAllocation.quantity);
                    itemsToUpdate.push(screenUnitItem);
                }
            }
            if (!(0, remeda_1.isNullish)(recipientUnitItem)) {
                recipientUnitItem.balanceQuantity = Number(recipientUnitItem.balanceQuantity) - Number(eatAllocation.quantity);
                recipientUnitItem.confirmedQuantity = Number(recipientUnitItem.confirmedQuantity) - Number(eatAllocation.quantity);
                if (recipientUnitItem.confirmedQuantity === 0) {
                    await this.unitStatusRepository.updateStatuses([{
                            date: new Date(eatAllocation.date),
                            unitId: eatAllocation.unitId,
                            unitStatusId: constants_1.UNIT_STATUSES.WAITING_FOR_ALLOCATION
                        }], transaction);
                }
                itemsToUpdate.push(recipientUnitItem);
            }
            await this.repository.updateReportsItems(itemsToUpdate, transaction);
            await transaction.commit();
            return {
                message: 'ההקצאה נאכלה בהצלחה',
                type: constants_1.MESSAGE_TYPES.SUCCESS
            };
        }
        catch (error) {
            console.log(error);
            await transaction.rollback();
            throw new common_1.BadRequestException({
                message: 'נכשלה אכילת ההקצאה, יש לנסות שוב',
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
    }
};
exports.ReportItemService = ReportItemService;
exports.ReportItemService = ReportItemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [report_item_repository_1.ReportItemRepository,
        unit_repository_1.UnitRepository,
        units_statuses_repository_1.UnitStatusRepository,
        sequelize_typescript_1.Sequelize])
], ReportItemService);
//# sourceMappingURL=report-item.service.js.map