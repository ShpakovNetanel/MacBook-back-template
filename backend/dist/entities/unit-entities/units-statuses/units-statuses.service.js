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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitStatusService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const units_statuses_repository_1 = require("./units-statuses.repository");
let UnitStatusService = class UnitStatusService {
    repository;
    sequelize;
    constructor(repository, sequelize) {
        this.repository = repository;
        this.sequelize = sequelize;
    }
    async updateHierarchyStatuses(unitsStatuses, date) {
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
        }
        catch (error) {
            console.log(error);
            await transaction.rollback();
        }
    }
};
exports.UnitStatusService = UnitStatusService;
exports.UnitStatusService = UnitStatusService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, sequelize_1.InjectConnection)()),
    __metadata("design:paramtypes", [units_statuses_repository_1.UnitStatusRepository,
        sequelize_typescript_1.Sequelize])
], UnitStatusService);
//# sourceMappingURL=units-statuses.service.js.map