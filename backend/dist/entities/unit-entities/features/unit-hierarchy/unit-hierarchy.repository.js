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
exports.UnitHierarchyRepository = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const remeda_1 = require("remeda");
const sequelize_2 = require("sequelize");
const constants_1 = require("../../../../constants");
const unit_id_model_1 = require("../../unit-id/unit-id.model");
const unit_relation_model_1 = require("../../unit-relations/unit-relation.model");
const unit_status_type_model_1 = require("../../unit-status-type/unit-status-type.model");
const unit_model_1 = require("../../unit/unit.model");
const units_statuses_model_1 = require("../../units-statuses/units-statuses.model");
let UnitHierarchyRepository = class UnitHierarchyRepository {
    unitRelationModel;
    unitStatusTypesModel;
    unitDetailModel;
    constructor(unitRelationModel, unitStatusTypesModel, unitDetailModel) {
        this.unitRelationModel = unitRelationModel;
        this.unitStatusTypesModel = unitStatusTypesModel;
        this.unitDetailModel = unitDetailModel;
    }
    fetchActive(date, unitId) {
        const unitRelationWhereClause = {};
        if ((0, remeda_1.isDefined)(unitId)) {
            unitRelationWhereClause['unitId'] = unitId;
        }
        ;
        return this.unitRelationModel.findAll({
            include: [{
                    attributes: ['id'],
                    model: unit_id_model_1.UnitId,
                    as: 'unit',
                    required: true,
                    include: [{
                            attributes: ['unitStatusId'],
                            model: units_statuses_model_1.UnitStatus,
                            as: 'unitStatus',
                            required: false,
                            include: [{
                                    model: unit_status_type_model_1.UnitStatusType,
                                    as: "unitStatus",
                                }],
                            where: {
                                date,
                            }
                        },
                        {
                            attributes: ["unitId", "description", "tsavIrgunCodeId", "unitLevelId"],
                            model: unit_model_1.Unit
                        }]
                },
                {
                    attributes: ['id'],
                    model: unit_id_model_1.UnitId,
                    as: 'relatedUnit',
                    required: true,
                    include: [{
                            attributes: ['unitStatusId'],
                            model: units_statuses_model_1.UnitStatus,
                            as: 'unitStatus',
                            required: false,
                            include: [{
                                    model: unit_status_type_model_1.UnitStatusType,
                                    as: "unitStatus",
                                }],
                            where: {
                                date,
                            }
                        },
                        {
                            attributes: ["unitId", "description", "tsavIrgunCodeId", "unitLevelId"],
                            model: unit_model_1.Unit
                        }]
                }],
            where: {
                ...unitRelationWhereClause,
                unitRelationId: constants_1.UNIT_RELATION_TYPES.ZRA,
                startDate: { [sequelize_2.Op.lte]: date },
                endDate: { [sequelize_2.Op.gt]: date }
            }
        });
    }
    fetchAllActiveUnitDetails(date) {
        return this.unitDetailModel.findAll({
            attributes: ["unitId", "description", "tsavIrgunCodeId", "unitLevelId"],
            where: {
                startDate: { [sequelize_2.Op.lte]: date },
                endDate: { [sequelize_2.Op.gt]: date },
            },
            order: [["startDate", "DESC"]],
        });
    }
    async fetchUnitsForExcelImport(date, { unitIds = [], unitSimuls = [], }) {
        if (unitIds.length === 0 && unitSimuls.length === 0)
            return [];
        const unitDetails = await this.unitDetailModel.findAll({
            attributes: ["unitId", "description", "tsavIrgunCodeId", "unitLevelId"],
            where: {
                startDate: { [sequelize_2.Op.lte]: date },
                endDate: { [sequelize_2.Op.gt]: date },
                [sequelize_2.Op.or]: [
                    ...(unitIds.length > 0 ? [{ unitId: { [sequelize_2.Op.in]: unitIds } }] : []),
                    ...(unitSimuls.length > 0 ? [{ tsavIrgunCodeId: { [sequelize_2.Op.in]: unitSimuls } }] : []),
                ]
            },
            order: [["startDate", "DESC"]],
        });
        if (unitDetails.length === 0)
            return [];
        const uniqueUnitIds = Array.from(new Set(unitDetails.map((detail) => detail.unitId)));
        const unitStatuses = await this.fetchUnitStatusesForDate(date, uniqueUnitIds);
        const detailByUnit = new Map();
        for (const detail of unitDetails) {
            if (!detailByUnit.has(detail.unitId)) {
                detailByUnit.set(detail.unitId, detail);
            }
        }
        const statusByUnit = new Map();
        for (const status of unitStatuses) {
            if (!statusByUnit.has(status.unitId)) {
                statusByUnit.set(status.unitId, status);
            }
        }
        return uniqueUnitIds.map((unitId) => {
            const detail = detailByUnit.get(unitId);
            const status = statusByUnit.get(unitId)?.unitStatus;
            return {
                unitId,
                description: detail?.description ?? null,
                unitLevelId: detail?.unitLevelId ?? null,
                simul: detail?.tsavIrgunCodeId ?? null,
                statusId: status?.id ?? 0,
                statusDescription: status?.description ?? "",
            };
        });
    }
    fetchUnitStatusesForDate(date, unitIds) {
        if (unitIds.length === 0)
            return Promise.resolve([]);
        return this.unitStatusTypesModel.findAll({
            attributes: ["unitId", "unitStatusId", "date"],
            where: {
                unitId: { [sequelize_2.Op.in]: unitIds },
                date,
            },
            include: [{
                    model: unit_status_type_model_1.UnitStatusType,
                    as: "unitStatus",
                }],
            order: [["date", "DESC"]],
        });
    }
    fetchDirectParentRelations(date, childUnitIds) {
        if (childUnitIds.length === 0)
            return Promise.resolve([]);
        return this.unitRelationModel.findAll({
            attributes: ["unitId", "relatedUnitId"],
            where: {
                unitRelationId: constants_1.UNIT_RELATION_TYPES.ZRA,
                relatedUnitId: { [sequelize_2.Op.in]: childUnitIds },
                startDate: { [sequelize_2.Op.lte]: date },
                endDate: { [sequelize_2.Op.gt]: date },
            },
            order: [["startDate", "DESC"]],
        });
    }
    async isUnitUnderRootUnit(date, rootUnitId, lowerUnitId, transaction) {
        if (rootUnitId === lowerUnitId)
            return true;
        const visited = new Set([rootUnitId]);
        let frontier = [rootUnitId];
        while (frontier.length > 0) {
            const relations = await this.unitRelationModel.findAll({
                attributes: ["unitId", "relatedUnitId"],
                where: {
                    unitRelationId: constants_1.UNIT_RELATION_TYPES.ZRA,
                    unitId: { [sequelize_2.Op.in]: frontier },
                    startDate: { [sequelize_2.Op.lte]: date },
                    endDate: { [sequelize_2.Op.gt]: date },
                },
                transaction,
            });
            const next = [];
            for (const relation of relations) {
                const childId = relation.relatedUnitId;
                if (childId === lowerUnitId)
                    return true;
                if (visited.has(childId))
                    continue;
                visited.add(childId);
                next.push(childId);
            }
            frontier = next;
        }
        return false;
    }
    fetchUnitsActiveDetails(date, unitIds, transaction) {
        if (unitIds.length === 0)
            return Promise.resolve([]);
        return this.unitDetailModel.findAll({
            attributes: ["unitId", "objectType", "unitLevelId"],
            where: {
                unitId: { [sequelize_2.Op.in]: unitIds },
                startDate: { [sequelize_2.Op.lte]: date },
                endDate: { [sequelize_2.Op.gt]: date },
            },
            order: [["startDate", "DESC"]],
            transaction,
        });
    }
    createParentRelation(upperUnit, lowerUnit, date, transaction) {
        return this.unitRelationModel.upsert({
            unitId: upperUnit,
            relatedUnitId: lowerUnit,
            unitRelationId: constants_1.UNIT_RELATION_TYPES.ZRA,
            unitObjectType: 'O',
            relatedUnitObjectType: 'O',
            startDate: new Date(date),
            endDate: new Date("9999-12-31"),
        }, { transaction });
    }
    fetchCurrentParentRelation(lowerUnit, date, transaction) {
        return this.unitRelationModel.findOne({
            where: {
                unitRelationId: constants_1.UNIT_RELATION_TYPES.ZRA,
                relatedUnitId: lowerUnit,
                startDate: { [sequelize_2.Op.lte]: date },
                endDate: { [sequelize_2.Op.gt]: date },
            },
            order: [["startDate", "DESC"]],
            transaction,
        });
    }
    fetchUnitStatusForDate(unitId, date, transaction) {
        return this.unitStatusTypesModel.findOne({
            attributes: ["unitStatusId"],
            where: {
                unitId,
                date,
            },
            order: [["date", "DESC"]],
            transaction,
        });
    }
    closeRelationOnDate(relation, date, transaction) {
        return relation.update({
            endDate: new Date(date),
        }, { transaction });
    }
};
exports.UnitHierarchyRepository = UnitHierarchyRepository;
exports.UnitHierarchyRepository = UnitHierarchyRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(unit_relation_model_1.UnitRelation)),
    __param(1, (0, sequelize_1.InjectModel)(units_statuses_model_1.UnitStatus)),
    __param(2, (0, sequelize_1.InjectModel)(unit_model_1.Unit)),
    __metadata("design:paramtypes", [Object, Object, Object])
], UnitHierarchyRepository);
//# sourceMappingURL=unit-hierarchy.repository.js.map