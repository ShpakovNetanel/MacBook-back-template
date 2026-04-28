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
exports.UnitStatusRepository = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const constants_1 = require("../../../constants");
const unit_relation_model_1 = require("../unit-relations/unit-relation.model");
const units_statuses_model_1 = require("./units-statuses.model");
let UnitStatusRepository = class UnitStatusRepository {
    unitStatusModel;
    unitRelationModel;
    constructor(unitStatusModel, unitRelationModel) {
        this.unitStatusModel = unitStatusModel;
        this.unitRelationModel = unitRelationModel;
    }
    async fetchHierarchyUnitIds(date, unitIds, transaction) {
        const rootUnitIds = [...new Set(unitIds)];
        if (rootUnitIds.length === 0)
            return [];
        const now = new Date(date);
        const visited = new Set(rootUnitIds);
        const hierarchyUnitIds = [...rootUnitIds];
        let frontier = rootUnitIds;
        while (frontier.length > 0) {
            const relations = await this.unitRelationModel.findAll({
                attributes: ["relatedUnitId"],
                where: {
                    unitRelationId: constants_1.UNIT_RELATION_TYPES.ZRA,
                    unitId: { [sequelize_2.Op.in]: frontier },
                    startDate: { [sequelize_2.Op.lt]: now },
                    endDate: { [sequelize_2.Op.gte]: now }
                },
                transaction,
            });
            const next = [];
            for (const relation of relations) {
                const childId = relation.relatedUnitId;
                if (visited.has(childId))
                    continue;
                visited.add(childId);
                hierarchyUnitIds.push(childId);
                next.push(childId);
            }
            frontier = next;
        }
        return hierarchyUnitIds;
    }
    updateStatuses(unitsStatuses, transaction) {
        return this.unitStatusModel.bulkCreate(unitsStatuses, {
            updateOnDuplicate: ['unitStatusId'],
            transaction
        });
    }
    clearStatusesForUnitsDate(unitIds, date, transaction) {
        if (unitIds.length === 0)
            return Promise.resolve(0);
        return this.unitStatusModel.destroy({
            where: {
                unitId: { [sequelize_2.Op.in]: unitIds },
                date,
            },
            transaction,
        });
    }
    clearStatusForUnitDate(unitId, date, transaction) {
        return this.unitStatusModel.destroy({
            where: {
                unitId,
                date,
            },
            transaction,
        });
    }
};
exports.UnitStatusRepository = UnitStatusRepository;
exports.UnitStatusRepository = UnitStatusRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(units_statuses_model_1.UnitStatus)),
    __param(1, (0, sequelize_1.InjectModel)(unit_relation_model_1.UnitRelation)),
    __metadata("design:paramtypes", [Object, Object])
], UnitStatusRepository);
//# sourceMappingURL=units-statuses.repository.js.map