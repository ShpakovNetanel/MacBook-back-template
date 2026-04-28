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
var ReportRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRepository = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const remeda_1 = require("remeda");
const sequelize_2 = require("sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const constants_1 = require("../../../constants");
const categories_model_1 = require("../../material-entities/categories/categories.model");
const material_category_model_1 = require("../../material-entities/material-category/material-category.model");
const material_nickname_model_1 = require("../../material-entities/material-nickname/material-nickname.model");
const material_model_1 = require("../../material-entities/material/material.model");
const unit_favorite_material_model_1 = require("../../material-entities/unit-favorite-material/unit-favorite-material.model");
const material_standard_group_model_1 = require("../../standard-entities/material-standard-group/material-standard-group.model");
const standard_group_model_1 = require("../../standard-entities/standard-group/standard-group.model");
const unit_id_model_1 = require("../../unit-entities/unit-id/unit-id.model");
const unit_relation_model_1 = require("../../unit-entities/unit-relations/unit-relation.model");
const units_statuses_model_1 = require("../../unit-entities/units-statuses/units-statuses.model");
const date_1 = require("../../../utils/date");
const report_item_model_1 = require("../report-item/report-item.model");
const report_model_1 = require("./report.model");
let ReportRepository = ReportRepository_1 = class ReportRepository {
    reportModel;
    reportItemModel;
    unitFavoriteMaterialModel;
    unitRelationModel;
    materialModel;
    materialStandardGroupModel;
    standardGroupModel;
    logger = new common_1.Logger(ReportRepository_1.name);
    constructor(reportModel, reportItemModel, unitFavoriteMaterialModel, unitRelationModel, materialModel, materialStandardGroupModel, standardGroupModel) {
        this.reportModel = reportModel;
        this.reportItemModel = reportItemModel;
        this.unitFavoriteMaterialModel = unitFavoriteMaterialModel;
        this.unitRelationModel = unitRelationModel;
        this.materialModel = materialModel;
        this.materialStandardGroupModel = materialStandardGroupModel;
        this.standardGroupModel = standardGroupModel;
    }
    async saveReports({ reportsToSave, transaction, skipEmptyItems = true, fieldsToUpdate = ["confirmedQuantity"] }) {
        try {
            const updateOnDuplicate = Array.from(new Set([
                "modifiedAt",
                "changedAt",
                "changedBy",
                "status",
                ...fieldsToUpdate,
            ]));
            for (const reportToSave of reportsToSave) {
                if ((0, remeda_1.isEmpty)(reportToSave.items) && skipEmptyItems)
                    continue;
                const modifiedReport = await this.reportModel.upsert(reportToSave.header, {
                    conflictFields: ['created_on', 'recipient_unit_id', 'unit_id', 'report_type_id'],
                    transaction
                });
                const itemsToModify = reportToSave.items.map(item => ({
                    ...item,
                    reportId: modifiedReport[0].dataValues.id
                }));
                if (!(0, remeda_1.isEmpty)(reportToSave.items)) {
                    await this.reportItemModel.bulkCreate(itemsToModify, {
                        conflictAttributes: ["reportId", "materialId", "reportingLevel"],
                        updateOnDuplicate,
                        transaction
                    });
                }
            }
        }
        catch (error) {
            this.logger.error("Failed to save reports", error instanceof Error ? error.stack : String(error));
            throw new common_1.BadGatewayException({
                message: 'נכשלה פעולת השמירה, יש לנסות שוב',
                type: 'Failure'
            });
        }
    }
    async fetchParentUnits(date, childUnitIds) {
        if (childUnitIds.length === 0)
            return new Map();
        const relations = await this.unitRelationModel.findAll({
            attributes: ["unitId", "relatedUnitId"],
            where: {
                unitRelationId: constants_1.UNIT_RELATION_TYPES.ZRA,
                relatedUnitId: { [sequelize_2.Op.in]: childUnitIds },
                startDate: { [sequelize_2.Op.lte]: date },
                endDate: { [sequelize_2.Op.gt]: date }
            }
        });
        const parentByChild = new Map();
        for (const relation of relations) {
            if (!parentByChild.has(relation.relatedUnitId)) {
                parentByChild.set(relation.relatedUnitId, relation.unitId);
            }
        }
        return parentByChild;
    }
    async fetchDescendantUnits(date, rootUnitId) {
        const visited = new Set([rootUnitId]);
        const parentByChild = new Map();
        const descendantIds = [];
        let units = [rootUnitId];
        while (units.length > 0) {
            const relations = await this.unitRelationModel.findAll({
                attributes: ["unitId", "relatedUnitId"],
                include: [{
                        model: unit_id_model_1.UnitId,
                        as: "relatedUnit",
                        required: true,
                        include: [{
                                model: units_statuses_model_1.UnitStatus,
                                required: true,
                                where: {
                                    unitStatusId: { [sequelize_2.Op.ne]: constants_1.UNIT_STATUSES.REQUESTING },
                                },
                            }]
                    }],
                where: {
                    unitRelationId: constants_1.UNIT_RELATION_TYPES.ZRA,
                    unitId: { [sequelize_2.Op.in]: units },
                    startDate: { [sequelize_2.Op.lte]: date },
                    endDate: { [sequelize_2.Op.gt]: date }
                },
            });
            const next = [];
            for (const relation of relations) {
                const childId = relation.relatedUnitId;
                if (!visited.has(childId)) {
                    visited.add(childId);
                    parentByChild.set(childId, relation.unitId);
                    descendantIds.push(childId);
                    next.push(childId);
                }
            }
            units = next;
        }
        return { descendantIds, parentByChild };
    }
    async fetchReportsByTypeAndUnitsForMaterials(date, reportType, materials = [], units) {
        return this.reportModel.findAll({
            include: [{
                    association: 'items',
                    where: {
                        materialId: { [sequelize_2.Op.in]: materials }
                    }
                }],
            where: {
                reportTypeId: reportType,
                createdOn: new Date(date),
                unitId: { [sequelize_2.Op.in]: units }
            }
        });
    }
    async fetchActiveReportItemQuantitiesByUnitAndMaterial(date, reportType, materialIds, unitIds) {
        if (materialIds.length === 0 || unitIds.length === 0)
            return [];
        const reports = await this.reportModel.findAll({
            attributes: ["unitId"],
            where: {
                reportTypeId: reportType,
                createdOn: new Date(date),
                unitId: { [sequelize_2.Op.in]: unitIds },
            },
            include: [{
                    association: "items",
                    required: true,
                    attributes: ["materialId", "confirmedQuantity", "reportedQuantity"],
                    where: {
                        materialId: { [sequelize_2.Op.in]: materialIds },
                        status: constants_1.RECORD_STATUS.ACTIVE,
                    },
                }],
        });
        const quantityByUnitMaterial = new Map();
        for (const report of reports) {
            for (const item of report.items ?? []) {
                const quantity = Number(item.confirmedQuantity ?? item.reportedQuantity ?? 0);
                const safeQuantity = Number.isNaN(quantity) ? 0 : quantity;
                const key = `${report.unitId}:${item.materialId}`;
                quantityByUnitMaterial.set(key, (quantityByUnitMaterial.get(key) ?? 0) + safeQuantity);
            }
        }
        return Array.from(quantityByUnitMaterial.entries()).map(([key, quantity]) => {
            const [unitIdAsString, materialId] = key.split(":");
            return {
                unitId: Number(unitIdAsString),
                materialId,
                quantity,
            };
        });
    }
    async fetchActiveReportItemQuantitiesByUnitMaterialAndType(date, reportTypeIds, materialIds, unitIds) {
        if (reportTypeIds.length === 0 || materialIds.length === 0 || unitIds.length === 0)
            return [];
        const reports = await this.reportModel.findAll({
            attributes: ["unitId", "reportTypeId"],
            where: {
                reportTypeId: { [sequelize_2.Op.in]: reportTypeIds },
                createdOn: new Date(date),
                unitId: { [sequelize_2.Op.in]: unitIds },
            },
            include: [{
                    association: "items",
                    required: true,
                    attributes: ["materialId", "confirmedQuantity", "reportedQuantity"],
                    where: {
                        materialId: { [sequelize_2.Op.in]: materialIds },
                        status: constants_1.RECORD_STATUS.ACTIVE,
                    },
                }],
        });
        const quantityByKey = new Map();
        for (const report of reports) {
            for (const item of report.items ?? []) {
                const quantity = Number(item.confirmedQuantity ?? item.reportedQuantity ?? 0);
                const safeQuantity = Number.isNaN(quantity) ? 0 : quantity;
                const key = `${report.reportTypeId}:${report.unitId}:${item.materialId}`;
                quantityByKey.set(key, (quantityByKey.get(key) ?? 0) + safeQuantity);
            }
        }
        return Array.from(quantityByKey.entries()).map(([key, quantity]) => {
            const [reportTypeIdAsString, unitIdAsString, materialId] = key.split(":");
            return {
                reportTypeId: Number(reportTypeIdAsString),
                unitId: Number(unitIdAsString),
                materialId,
                quantity,
            };
        });
    }
    async fetchReportsData(date, recipientUnitId, material = '') {
        const { unitIds } = await this.buildReportScope(date, recipientUnitId);
        return this.fetchReportsByScope({
            date,
            reportingUnitIds: unitIds,
            material,
            itemStatuses: [constants_1.RECORD_STATUS.ACTIVE, constants_1.RECORD_STATUS.INACTIVE]
        });
    }
    async fetchAllocationReportsData(date, recipientUnitId) {
        const { unitIds } = await this.buildReportScope(date, recipientUnitId);
        return this.fetchReportsByScope({
            date,
            reportingUnitIds: unitIds,
            recipientUnitIds: unitIds,
            reportTypeIds: [constants_1.REPORT_TYPES.ALLOCATION],
            itemStatuses: [constants_1.RECORD_STATUS.ACTIVE, constants_1.RECORD_STATUS.INACTIVE]
        });
    }
    async fetchReportsForRecipientsByType(date, reportTypeId, recipientUnitIds, reportingUnitIds = [], materialIds = []) {
        if (recipientUnitIds.length === 0)
            return [];
        return this.fetchReportsByScope({
            date,
            reportingUnitIds,
            recipientUnitIds,
            reportTypeIds: [reportTypeId],
            itemStatuses: [constants_1.RECORD_STATUS.ACTIVE, constants_1.RECORD_STATUS.INACTIVE],
            materialIds
        });
    }
    async fetchIncomingAllocationReports(date, recipientUnitId, materialIds = []) {
        return this.reportModel.findAll({
            where: {
                recipientUnitId,
                createdOn: date,
                reportTypeId: constants_1.REPORT_TYPES.ALLOCATION,
            },
            include: this.buildReportsInclude(date, undefined, [constants_1.RECORD_STATUS.ACTIVE, constants_1.RECORD_STATUS.INACTIVE], materialIds),
        });
    }
    async fetchOutgoingAllocationReports(date, unitId, recipientUnitIds, materialIds = []) {
        if (recipientUnitIds.length === 0)
            return [];
        return this.fetchReportsByScope({
            date,
            reportingUnitIds: [unitId],
            recipientUnitIds,
            reportTypeIds: [constants_1.REPORT_TYPES.ALLOCATION],
            itemStatuses: [constants_1.RECORD_STATUS.ACTIVE],
            materialIds,
        });
    }
    async fetchStandardGroupMaterials(groupIds) {
        if (groupIds.length === 0)
            return [];
        const mappings = await this.materialStandardGroupModel.findAll({
            where: {
                groupId: { [sequelize_2.Op.in]: groupIds },
            },
            include: [{
                    model: material_model_1.Material,
                    required: true,
                    attributes: ["id", "description", "unitOfMeasurement"],
                }, {
                    model: standard_group_model_1.StandardGroup,
                    required: true,
                    attributes: ["id", "name"],
                }],
            order: [["groupId", "ASC"], ["materialId", "ASC"]],
        });
        return mappings.map((mapping) => ({
            groupId: mapping.groupId,
            groupDescription: mapping.standardGroup?.name ?? "",
            materialId: mapping.materialId,
            materialDescription: mapping.material?.description ?? "",
            unitOfMeasurement: mapping.material?.unitOfMeasurement ?? "",
        }));
    }
    async fetchFavoriteReportsData(date, recipientUnitId) {
        const favorites = await this.unitFavoriteMaterialModel.findAll({
            attributes: ["materialId"],
            where: { unitId: recipientUnitId }
        });
        const favoriteMaterialIds = Array.from(new Set(favorites.map((favorite) => favorite.materialId)));
        if (favoriteMaterialIds.length === 0)
            return [];
        const { descendantIds, unitIds } = await this.buildReportScope(date, recipientUnitId);
        return this.fetchReportsByScope({
            date,
            reportingUnitIds: descendantIds,
            recipientUnitIds: unitIds,
            itemStatuses: [constants_1.RECORD_STATUS.ACTIVE, constants_1.RECORD_STATUS.INACTIVE],
            materialIds: favoriteMaterialIds
        });
    }
    async fetchFavoriteMaterials(recipientUnitId) {
        const favorites = await this.unitFavoriteMaterialModel.findAll({
            attributes: ["materialId"],
            where: { unitId: recipientUnitId }
        });
        const favoriteIds = Array.from(new Set(favorites.map((favorite) => favorite.materialId)));
        if (favoriteIds.length === 0)
            return [];
        const [materials, standardGroups] = await Promise.all([
            this.materialModel.findAll({
                where: {
                    id: { [sequelize_2.Op.in]: favoriteIds },
                    recordStatus: constants_1.RECORD_STATUS.ACTIVE
                },
                include: [{
                        association: "nickname",
                        required: false,
                    }, {
                        association: "materialCategory",
                        required: false,
                        include: [{
                                association: "mainCategory",
                                required: false,
                            }],
                    }],
            }),
            this.standardGroupModel.findAll({
                include: [{
                        association: "nickname",
                        required: false,
                    }, {
                        association: "categoryGroup",
                        required: false,
                        include: [{
                                association: "categoryDesc",
                                attributes: ["description"],
                                required: false,
                            }],
                    }],
                where: {
                    id: { [sequelize_2.Op.in]: favoriteIds }
                }
            })
        ]);
        return [
            ...materials.map((material) => ({
                id: material.id,
                description: material.description ?? "",
                multiply: Number(material.multiply ?? 0),
                nickname: material.nickname?.nickname ?? "",
                category: material.materialCategory?.mainCategory?.description ?? "",
                unitOfMeasure: material.unitOfMeasurement ?? "",
                type: constants_1.MATERIAL_TYPES.ITEM,
                isGroup: false
            })),
            ...standardGroups.map((standardGroup) => ({
                id: standardGroup.id,
                description: standardGroup.name ?? "",
                multiply: 0,
                nickname: standardGroup.nickname?.nickname ?? "",
                category: standardGroup.categoryGroup?.categoryDesc?.description ?? "קבוצה",
                unitOfMeasure: "",
                type: standardGroup.groupType,
                isGroup: true
            }))
        ].sort((left, right) => left.id.localeCompare(right.id));
    }
    async fetchMostRecentReportsData(date, recipientUnitId) {
        const { descendantIds, unitIds } = await this.buildReportScope(date, recipientUnitId);
        if (descendantIds.length === 0)
            return [];
        const latestCreatedOn = await this.reportModel.max("createdOn", {
            where: {
                unitId: { [sequelize_2.Op.in]: descendantIds },
                recipientUnitId: { [sequelize_2.Op.in]: unitIds },
                createdOn: { [sequelize_2.Op.lt]: date },
                reportTypeId: { [sequelize_2.Op.in]: [constants_1.REPORT_TYPES.REQUEST, constants_1.REPORT_TYPES.INVENTORY, constants_1.REPORT_TYPES.USAGE] }
            }
        });
        if ((0, remeda_1.isNullish)(latestCreatedOn))
            return [];
        const { formattedDate: latestDate } = (0, date_1.formatDate)(latestCreatedOn);
        return this.fetchReportsByScope({
            date: latestDate,
            reportingUnitIds: descendantIds,
            recipientUnitIds: unitIds,
            itemStatuses: [constants_1.RECORD_STATUS.ACTIVE, constants_1.RECORD_STATUS.INACTIVE]
        });
    }
    async fetchHierarchyReportsByType(date, recipientUnitId, reportTypeId, materialIds = []) {
        if (materialIds.length === 0)
            return [];
        const { unitIds } = await this.buildReportScope(date, recipientUnitId);
        return this.fetchReportsByScope({
            date,
            reportingUnitIds: unitIds,
            reportTypeIds: [reportTypeId],
            itemStatuses: [constants_1.RECORD_STATUS.ACTIVE, constants_1.RECORD_STATUS.INACTIVE],
            materialIds,
        });
    }
    async fetchReportsDataForUnits(date, unitIds) {
        if (unitIds.length === 0)
            return [];
        return this.reportModel.findAll({
            where: {
                unitId: { [sequelize_2.Op.in]: unitIds },
                recipientUnitId: { [sequelize_2.Op.in]: unitIds },
                createdOn: date,
                reportTypeId: { [sequelize_2.Op.in]: [constants_1.REPORT_TYPES.REQUEST, constants_1.REPORT_TYPES.INVENTORY, constants_1.REPORT_TYPES.USAGE] },
            },
            include: this.buildReportsInclude(date),
        });
    }
    async buildReportScope(date, recipientUnitId) {
        const { descendantIds } = await this.fetchDescendantUnits(new Date(date), recipientUnitId);
        return {
            descendantIds,
            unitIds: [recipientUnitId, ...descendantIds]
        };
    }
    fetchReportsByScope({ date, reportingUnitIds = [], recipientUnitIds, reportTypeIds = [constants_1.REPORT_TYPES.REQUEST, constants_1.REPORT_TYPES.INVENTORY, constants_1.REPORT_TYPES.USAGE], material = '', itemStatuses = [constants_1.RECORD_STATUS.ACTIVE], materialIds }) {
        if (reportingUnitIds.length === 0 && !recipientUnitIds?.length)
            return Promise.resolve([]);
        const whereClause = {
            createdOn: date,
            reportTypeId: { [sequelize_2.Op.in]: reportTypeIds }
        };
        if (reportingUnitIds.length > 0) {
            whereClause.unitId = { [sequelize_2.Op.in]: reportingUnitIds };
        }
        if (recipientUnitIds?.length) {
            whereClause.recipientUnitId = { [sequelize_2.Op.in]: recipientUnitIds };
        }
        return this.reportModel.findAll({
            where: whereClause,
            include: this.buildReportsInclude(date, material, itemStatuses, materialIds),
        });
    }
    buildReportsInclude(date, material = '', itemStatuses = [constants_1.RECORD_STATUS.ACTIVE], materialIds = []) {
        const materialFilter = materialIds.length > 0
            ? { [sequelize_2.Op.in]: materialIds }
            : { [sequelize_2.Op.iLike]: `%${material}%` };
        return [{
                association: "unit",
                required: false,
                include: [{
                        association: "details",
                        required: false,
                        attributes: ["unitId", "description", "unitLevelId", "startDate", "tsavIrgunCodeId"],
                        where: {
                            startDate: { [sequelize_2.Op.lte]: date },
                            endDate: { [sequelize_2.Op.gt]: date }
                        }
                    }, {
                        association: "unitStatus",
                        required: false,
                        attributes: ["unitStatusId", "date"],
                        where: {
                            date,
                        },
                        include: [{
                                association: "unitStatus",
                                attributes: ["id", "description"],
                            }],
                    }]
            }, {
                association: "recipientUnit",
                required: false,
                include: [{
                        association: "details",
                        required: false,
                        attributes: ["unitId", "description", "unitLevelId", "startDate", "tsavIrgunCodeId"],
                        where: {
                            startDate: { [sequelize_2.Op.lte]: date },
                            endDate: { [sequelize_2.Op.gt]: date }
                        }
                    }, {
                        association: "unitStatus",
                        required: false,
                        attributes: ["unitStatusId", "date"],
                        where: {
                            date,
                        },
                        include: [{
                                association: "unitStatus",
                                attributes: ["id", "description"],
                            }],
                    }]
            }, {
                attributes: ['reportedQuantity', 'confirmedQuantity', 'balanceQuantity', 'status', 'materialId', 'reportingLevel', 'reportingUnitId'],
                model: report_item_model_1.ReportItem,
                as: "items",
                include: [{
                        model: material_model_1.Material,
                        as: "material",
                        required: false,
                        include: [{
                                association: "comments",
                                required: false,
                                on: {
                                    [sequelize_2.Op.and]: [
                                        (0, sequelize_2.where)((0, sequelize_2.col)("items->material->comments.type"), sequelize_2.Op.eq, (0, sequelize_2.col)("Report.report_type_id")),
                                        (0, sequelize_2.where)((0, sequelize_2.col)("items->material->comments.material_id"), sequelize_2.Op.eq, (0, sequelize_2.col)("items.material_id")),
                                        (0, sequelize_2.where)((0, sequelize_2.col)("items->material->comments.date"), sequelize_2.Op.eq, (0, sequelize_2.col)("Report.created_on")),
                                        {
                                            [sequelize_2.Op.or]: [
                                                (0, sequelize_2.where)((0, sequelize_2.col)("items->material->comments.unit_id"), sequelize_2.Op.eq, (0, sequelize_2.col)("Report.unit_id")),
                                                (0, sequelize_2.where)((0, sequelize_2.col)("items->material->comments.unit_id"), sequelize_2.Op.eq, (0, sequelize_2.col)("Report.recipient_unit_id")),
                                            ]
                                        }
                                    ]
                                }
                            }, {
                                model: material_nickname_model_1.MaterialNickname,
                                as: "nickname",
                                required: false,
                            }, {
                                model: material_category_model_1.MaterialCategory,
                                as: "materialCategory",
                                required: false,
                                include: [{
                                        model: categories_model_1.MainCategory,
                                        as: "mainCategory",
                                        required: false,
                                    }],
                            }],
                    }, {
                        model: standard_group_model_1.StandardGroup,
                        as: "standardGroup",
                        required: false,
                        include: [{
                                association: "nickname",
                                required: false,
                            }, {
                                association: "categoryGroup",
                                required: false,
                                include: [{
                                        association: "categoryDesc",
                                        attributes: ["description"],
                                        required: false,
                                    }],
                            }]
                    }],
                where: {
                    materialId: materialFilter,
                    modifiedAt: {
                        [sequelize_2.Op.eq]: sequelize_typescript_1.Sequelize.literal(`(SELECT MAX(shoval.report_items."modified_at")
                                              FROM shoval.report_items
                                             WHERE shoval.report_items."report_id" = "Report"."id"
                                               AND shoval.report_items."material_id" = "items"."material_id"
                                               AND shoval.report_items."status" IN (${itemStatuses.map((status) => `'${status}'`).join(", ")}))`)
                    },
                    status: { [sequelize_2.Op.in]: itemStatuses }
                },
            }];
    }
};
exports.ReportRepository = ReportRepository;
exports.ReportRepository = ReportRepository = ReportRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(report_model_1.Report)),
    __param(1, (0, sequelize_1.InjectModel)(report_item_model_1.ReportItem)),
    __param(2, (0, sequelize_1.InjectModel)(unit_favorite_material_model_1.UnitFavoriteMaterial)),
    __param(3, (0, sequelize_1.InjectModel)(unit_relation_model_1.UnitRelation)),
    __param(4, (0, sequelize_1.InjectModel)(material_model_1.Material)),
    __param(5, (0, sequelize_1.InjectModel)(material_standard_group_model_1.MaterialStandardGroup)),
    __param(6, (0, sequelize_1.InjectModel)(standard_group_model_1.StandardGroup)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], ReportRepository);
//# sourceMappingURL=report.repository.js.map