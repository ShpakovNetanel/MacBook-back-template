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
var ReportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const remeda_1 = require("remeda");
const sequelize_1 = require("sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const constants_1 = require("../../../constants");
const date_1 = require("../../../utils/date");
const unit_hierarchy_service_1 = require("../../unit-entities/features/unit-hierarchy/unit-hierarchy.service");
const unit_repository_1 = require("../../unit-entities/unit/unit.repository");
const report_repository_1 = require("./report.repository");
const report_aggregate_hierarchy_utils_1 = require("./utilities/report-aggregate-hierarchy.utils");
const report_allocation_save_utils_1 = require("./utilities/report-allocation-save.utils");
const report_fetch_utils_1 = require("./utilities/report-fetch.utils");
const report_save_utils_1 = require("./utilities/report-save.utils");
const report_service_utils_1 = require("./utilities/report-service.utils");
let ReportService = ReportService_1 = class ReportService {
    repository;
    sequelize;
    unitHierarchyService;
    unitRepository;
    logger = new common_1.Logger(ReportService_1.name);
    constructor(repository, sequelize, unitHierarchyService, unitRepository) {
        this.repository = repository;
        this.sequelize = sequelize;
        this.unitHierarchyService = unitHierarchyService;
        this.unitRepository = unitRepository;
    }
    async saveReportsChanges(saveReportsBody, date, screenUnitId, username) {
        const changes = saveReportsBody?.changes ?? [];
        const reportingUnitId = screenUnitId;
        const transaction = await this.sequelize.transaction();
        const { formattedTime } = (0, date_1.formatDate)(new Date());
        const screenDate = new Date(date);
        try {
            const unitDetails = await this.unitRepository.fetchActiveUnitDetails(screenDate, reportingUnitId);
            const activeRelations = await this.unitHierarchyService.fetchActiveRelations(date);
            const lowerUnitsIds = (0, report_aggregate_hierarchy_utils_1.sortNumeric)(activeRelations.filter(reltion => reltion.dataValues.unitId === screenUnitId).map(unit => unit.dataValues.relatedUnitId));
            (0, report_aggregate_hierarchy_utils_1.assertLowerHierarchyStable)(saveReportsBody.children, lowerUnitsIds);
            const parentByChild = await this.repository.fetchParentUnits(screenDate, Array.from(new Set(changes.map(change => change.unitId))));
            const reportsToSave = (0, report_save_utils_1.buildReportsToSave)({
                changes,
                reportingLevel: unitDetails?.unitLevelId,
                reportingUnitId,
                recipientUnitId: screenUnitId,
                createdOn: screenDate,
                createdAt: formattedTime,
                createdBy: username,
                parentByChild
            });
            await this.repository.saveReports({
                reportsToSave,
                transaction,
                fieldsToUpdate: ["confirmedQuantity"],
            });
            await transaction.commit();
            return {
                type: constants_1.MESSAGE_TYPES.SUCCESS,
                message: "הנתונים נשמרו בהצלחה"
            };
        }
        catch (error) {
            this.logger.error("Failed to save report changes", error instanceof sequelize_1.Error ? error.stack : String(error));
            await transaction.rollback();
            throw new common_1.BadGatewayException({
                message: error?.response?.message ?? 'נכשלה פעולת השמירה, יש לנסות שוב',
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
    }
    async fetchReports(date, recipientUnitId) {
        const baseReports = await this.repository.fetchReportsData(date, recipientUnitId);
        const [allocationReports, screenAllocationReports] = await Promise.all([
            this.repository.fetchAllocationReportsData(date, recipientUnitId),
            this.repository.fetchIncomingAllocationReports(date, recipientUnitId),
        ]);
        const reports = [...baseReports, ...allocationReports, ...screenAllocationReports];
        const materialIds = (0, report_service_utils_1.collectMaterialIdsFromReports)([
            ...reports,
            ...screenAllocationReports,
        ]);
        const yesterdayInventoryReports = materialIds.length === 0
            ? []
            : await this.repository.fetchHierarchyReportsByType((0, date_1.getPreviousCalendarDate)(date), recipientUnitId, constants_1.REPORT_TYPES.INVENTORY, materialIds);
        return (0, report_fetch_utils_1.buildReportsResponse)({
            recipientUnitId,
            reports,
            yesterdayInventoryReports,
            screenAllocationReports,
        });
    }
    async fetchFavoriteReports(date, recipientUnitId) {
        try {
            const directChildren = await this.unitHierarchyService.fetchLowerUnits(date, recipientUnitId);
            const reportTypeIds = [
                constants_1.REPORT_TYPES.REQUEST,
                constants_1.REPORT_TYPES.INVENTORY,
                constants_1.REPORT_TYPES.USAGE,
                constants_1.REPORT_TYPES.ALLOCATION,
            ];
            const favoriteMaterials = await this.repository.fetchFavoriteMaterials(recipientUnitId);
            const yesterdayInventoryReports = favoriteMaterials.length === 0
                ? []
                : await this.repository.fetchHierarchyReportsByType((0, date_1.getPreviousCalendarDate)(date), recipientUnitId, constants_1.REPORT_TYPES.INVENTORY, favoriteMaterials.map((material) => material.id));
            const data = (0, report_fetch_utils_1.buildFavoriteReportsResponse)(favoriteMaterials, directChildren, reportTypeIds, yesterdayInventoryReports);
            if ((0, remeda_1.isEmptyish)(data)) {
                throw new common_1.BadGatewayException({
                    message: 'לא נמצאו מק״טים מועדפים',
                    type: constants_1.MESSAGE_TYPES.WARNING
                });
            }
            return {
                data: data,
                message: 'ייבוא המק״טים צלח',
                type: constants_1.MESSAGE_TYPES.SUCCESS
            };
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadGatewayException({
                message: error?.response?.message ?? 'הבאת מק״טים מועדפים נכשלה, יש לנסות שנית',
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
    }
    async fetchMostRecentMaterials(date, recipientUnitId) {
        try {
            const reports = await this.repository.fetchMostRecentReportsData(date, recipientUnitId);
            if ((0, remeda_1.isEmptyish)(reports)) {
                throw new common_1.BadGatewayException({
                    message: 'לא נמצאה ועדה אחרונה',
                    type: constants_1.MESSAGE_TYPES.WARNING
                });
            }
            const materialIds = (0, report_service_utils_1.collectMaterialIdsFromReports)(reports);
            const yesterdayInventoryReports = materialIds.length === 0
                ? []
                : await this.repository.fetchHierarchyReportsByType((0, date_1.getPreviousCalendarDate)(date), recipientUnitId, constants_1.REPORT_TYPES.INVENTORY, materialIds);
            return {
                data: (0, report_fetch_utils_1.buildReportsMaterialsResponse)({
                    recipientUnitId,
                    reports,
                    yesterdayInventoryReports,
                    fetchQuantity: false
                }),
                message: 'ייבוא המק״טים צלח',
                type: constants_1.MESSAGE_TYPES.SUCCESS
            };
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadGatewayException({
                message: error?.response?.message ?? 'נכשלה הבאת המק״טים מועדה אחרונה',
                type: error?.response?.type ?? constants_1.MESSAGE_TYPES.FAILURE
            });
        }
    }
    async aggregateHierarchy(date, screenUnitId, user, aggregatedReportsDTO) {
        const transaction = await this.sequelize.transaction();
        try {
            const activeRelations = await this.unitHierarchyService.fetchActiveRelations(date);
            const emergencyUnitLookup = this.unitHierarchyService.buildEmergencyUnitLookup(activeRelations);
            const { childrenByParent, parentsByChild, unitsById } = (0, report_aggregate_hierarchy_utils_1.buildHierarchyIndexes)(activeRelations, emergencyUnitLookup);
            const connectedUnitIds = (0, report_aggregate_hierarchy_utils_1.collectHierarchyUnitIds)(screenUnitId, childrenByParent);
            const connectedUnitSet = new Set(connectedUnitIds);
            const lowerUnitsIds = (0, report_aggregate_hierarchy_utils_1.sortNumeric)((childrenByParent.get(screenUnitId) ?? []).filter((unitId) => connectedUnitSet.has(unitId)));
            (0, report_aggregate_hierarchy_utils_1.assertLowerHierarchyStable)(aggregatedReportsDTO.lowerUnitsIds ?? [], lowerUnitsIds);
            const resolveUnit = (0, report_aggregate_hierarchy_utils_1.buildUnitResolver)(unitsById, emergencyUnitLookup);
            const unitsMap = (0, report_aggregate_hierarchy_utils_1.buildUnitsMap)(connectedUnitIds, screenUnitId, parentsByChild, resolveUnit);
            const childrenByParentMap = (0, report_aggregate_hierarchy_utils_1.buildChildrenByParentMap)(childrenByParent, connectedUnitSet, unitsMap, resolveUnit);
            const dbReports = await this.repository.fetchReportsDataForUnits(date, connectedUnitIds);
            const reportsToSave = await (0, report_aggregate_hierarchy_utils_1.getAggregatedReports)({
                date,
                unitsToLaunch: aggregatedReportsDTO.unitsIds,
                screenUnitId,
                unitsMap,
                childrenByParentMap,
                dbReports,
                username: user,
                isLaunching: aggregatedReportsDTO.isLaunching,
            });
            await this.repository.saveReports({
                reportsToSave: reportsToSave ?? [],
                transaction,
                fieldsToUpdate: ["confirmedQuantity", "reportedQuantity"],
            });
            await transaction.commit();
            return {
                type: (0, remeda_1.isEmptyish)(reportsToSave) ? constants_1.MESSAGE_TYPES.WARNING : constants_1.MESSAGE_TYPES.SUCCESS,
                message: (0, remeda_1.isEmptyish)(reportsToSave) ? 'אין דיווחים להעלות' : 'הדיווחים הועלו בהצלחה',
            };
        }
        catch (error) {
            await transaction.rollback();
            this.logger.error("Failed to aggregate hierarchy", error instanceof sequelize_1.Error ? error.stack : String(error));
            throw new common_1.BadGatewayException({
                message: error?.response?.message ?? 'נעילת ההיררכיה נכשלה, יש לנסות שוב',
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
    }
    async inventoryCalculation(date, screenUnitId, materialIds = []) {
        try {
            if (materialIds.length === 0) {
                throw new common_1.BadRequestException({
                    message: 'אין מק״טים לחשב עבורם מלאי',
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            const activeRelations = await this.unitHierarchyService.fetchActiveRelations(date);
            const emergencyUnitLookup = this.unitHierarchyService.buildEmergencyUnitLookup(activeRelations);
            const { childrenByParent, parentsByChild, unitsById } = (0, report_aggregate_hierarchy_utils_1.buildHierarchyIndexes)(activeRelations, emergencyUnitLookup);
            const connectedUnitIds = (0, report_service_utils_1.collectUnitsForLockedDirectChildBranches)(screenUnitId, childrenByParent, unitsById);
            const connectedUnitSet = new Set(connectedUnitIds);
            const gdudUnitIds = connectedUnitIds.filter((unitId) => (unitsById.get(unitId)?.level) === constants_1.UNIT_LEVELS.GDUD);
            const parentByChild = (0, report_service_utils_1.buildParentByChildForConnectedUnits)(connectedUnitIds, parentsByChild, connectedUnitSet);
            const previousDate = (0, date_1.getPreviousCalendarDate)(date);
            const [yesterdayInventory, todayUsage] = await Promise.all([
                this.repository.fetchActiveReportItemQuantitiesByUnitAndMaterial(previousDate, constants_1.REPORT_TYPES.INVENTORY, materialIds, gdudUnitIds),
                this.repository.fetchActiveReportItemQuantitiesByUnitAndMaterial(date, constants_1.REPORT_TYPES.USAGE, materialIds, gdudUnitIds),
            ]);
            const inventoryByUnitMaterial = (0, report_service_utils_1.buildUnitMaterialQuantityMap)(yesterdayInventory);
            const usageByUnitMaterial = (0, report_service_utils_1.buildUnitMaterialQuantityMap)(todayUsage);
            const aggregatedInventoryByUnitMaterial = (0, report_service_utils_1.aggregateGdudQuantitiesToAncestors)(inventoryByUnitMaterial, parentByChild, connectedUnitSet, screenUnitId, true);
            const aggregatedUsageByUnitMaterial = (0, report_service_utils_1.aggregateGdudQuantitiesToAncestors)(usageByUnitMaterial, parentByChild, connectedUnitSet, screenUnitId, true);
            const data = (0, report_service_utils_1.buildInventoryCalculationResults)(aggregatedInventoryByUnitMaterial, aggregatedUsageByUnitMaterial);
            if ((0, remeda_1.isEmptyish)(data)) {
                throw new common_1.BadGatewayException({
                    message: 'לא נמצא מלאי לחישוב',
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            return {
                data: data,
                message: 'חישוב המלאי הצליח',
                type: constants_1.MESSAGE_TYPES.SUCCESS
            };
        }
        catch (error) {
            console.log(error.response.message);
            throw new common_1.BadGatewayException({
                message: error?.response?.message ?? 'חישוב המלאי נכשל, יש לנסות שנית',
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
    }
    buildAllocationDuhUnitMap(directChildRelations) {
        const unitById = new Map();
        for (const relation of directChildRelations) {
            if (unitById.has(relation.relatedUnitId))
                continue;
            const detail = relation.relatedUnit?.activeDetail;
            if (!detail)
                continue;
            unitById.set(relation.relatedUnitId, {
                description: detail.description ?? "",
                simul: detail.tsavIrgunCodeId ?? "",
                unitLevelId: detail.unitLevelId ?? constants_1.UNIT_LEVELS.MATKAL,
            });
        }
        return unitById;
    }
    buildAllocationDuhSourceMaterialMap(reports, useRecipientUnitId) {
        const materialByUnitMaterial = new Map();
        for (const report of reports) {
            const targetUnitId = useRecipientUnitId
                ? report.recipientUnitId
                : report.unitId;
            if (targetUnitId === null)
                continue;
            for (const item of report.items ?? []) {
                const key = `${targetUnitId}:${item.materialId}`;
                if (materialByUnitMaterial.has(key))
                    continue;
                materialByUnitMaterial.set(key, {
                    materialId: item.materialId,
                    materialDescription: item.material?.description ?? item.standardGroup?.name ?? "",
                    unitOfMeasure: item.material?.unitOfMeasurement ?? "",
                    standardGroupId: item.standardGroup?.id,
                });
            }
        }
        return materialByUnitMaterial;
    }
    async buildAllocationDuhExport({ date, allocationChanges, directChildRelations, outgoingAllocationReports, requisitionReports, }) {
        if (allocationChanges.length === 0) {
            return null;
        }
        const unitById = this.buildAllocationDuhUnitMap(directChildRelations);
        const useOutgoingReports = outgoingAllocationReports.length > 0;
        const sourceMaterialByUnitMaterial = this.buildAllocationDuhSourceMaterialMap(useOutgoingReports ? outgoingAllocationReports : requisitionReports, useOutgoingReports);
        const standardGroupIds = Array.from(new Set(Array.from(sourceMaterialByUnitMaterial.values())
            .map((material) => material.standardGroupId)
            .filter((groupId) => !(0, remeda_1.isEmptyish)(groupId))));
        const standardGroupMaterials = await this.repository.fetchStandardGroupMaterials(standardGroupIds);
        const standardGroupMaterialsByGroupId = new Map();
        for (const mapping of standardGroupMaterials) {
            standardGroupMaterialsByGroupId.set(mapping.groupId, [
                ...(standardGroupMaterialsByGroupId.get(mapping.groupId) ?? []),
                mapping,
            ]);
        }
        const rows = allocationChanges.filter(change => change.quantity !== 0).flatMap((change) => {
            const unit = unitById.get(change.unitId);
            const material = sourceMaterialByUnitMaterial.get(`${change.unitId}:${change.materialId}`);
            if (!unit || !material) {
                return [];
            }
            const standardGroupMappings = material.standardGroupId
                ? standardGroupMaterialsByGroupId.get(material.standardGroupId) ?? []
                : [];
            const oneToOneGroupMaterial = standardGroupMappings.length === 1
                ? standardGroupMappings[0]
                : null;
            return [{
                    materialId: oneToOneGroupMaterial?.materialId ?? material.materialId,
                    materialDescription: oneToOneGroupMaterial?.materialDescription ?? material.materialDescription,
                    quantity: Number(change.quantity ?? 0),
                    unitOfMeasure: oneToOneGroupMaterial?.unitOfMeasurement ?? material.unitOfMeasure,
                    unitLevelId: unit.unitLevelId,
                    unitSimul: unit.simul,
                    unitDescription: unit.description,
                }];
        });
        if (rows.length === 0) {
            return null;
        }
        return {
            fileName: `נתוני דו״ה ${date}.xlsx`,
            rows,
            groupConversions: standardGroupMaterials.map((mapping) => ({
                groupId: mapping.groupId,
                groupDescription: mapping.groupDescription,
                materialId: mapping.materialId,
                materialDescription: mapping.materialDescription,
            })),
        };
    }
    async fetchAllocationDuhExport(date, screenUnitId, materialId) {
        const unitDetails = await this.unitRepository.fetchActiveUnitDetails(date, screenUnitId);
        if (!unitDetails || unitDetails.unitLevelId !== constants_1.UNIT_LEVELS.MATKAL) {
            throw new common_1.BadRequestException({
                message: "אקסל הקצאה דו״ה זמין רק ברמת מטכ״ל",
                type: constants_1.MESSAGE_TYPES.FAILURE,
            });
        }
        const directChildRelations = await this.unitHierarchyService.fetchLowerUnits(date, screenUnitId);
        const directChildIds = (0, report_aggregate_hierarchy_utils_1.sortNumeric)(directChildRelations.map((relation) => relation.relatedUnitId));
        const [outgoingAllocationReports, requisitionReports] = await Promise.all([
            this.repository.fetchOutgoingAllocationReports(date, screenUnitId, directChildIds, materialId ? [materialId] : []),
            directChildIds.length === 0
                ? Promise.resolve([])
                : this.repository.fetchReportsForRecipientsByType(date, constants_1.REPORT_TYPES.REQUEST, [screenUnitId], directChildIds, materialId ? [materialId] : [])
        ]);
        const allocationChanges = (0, report_allocation_save_utils_1.buildDownloadAllocationChanges)({
            isMatkal: true,
            outgoingAllocationReports,
            requisitionReports,
            isDvhExcel: true
        });
        return this.buildAllocationDuhExport({
            date,
            allocationChanges,
            directChildRelations,
            outgoingAllocationReports,
            requisitionReports,
        });
    }
    async saveAllocations(saveAllocationsDTO, date, screenUnitId, username) {
        const transaction = await this.sequelize.transaction();
        const { formattedTime } = (0, date_1.formatDate)(new Date());
        try {
            const unitDetails = await this.unitRepository.fetchActiveUnitDetails(date, screenUnitId);
            const reportsToSave = (0, report_allocation_save_utils_1.buildAllocationsChanges)({
                changes: saveAllocationsDTO.changes,
                username,
                creationTime: formattedTime,
                screenUnit: unitDetails,
                screenDate: new Date(date)
            });
            await this.repository.saveReports({
                reportsToSave,
                transaction,
                fieldsToUpdate: ["reportedQuantity"],
            });
            await transaction.commit();
            return {
                type: constants_1.MESSAGE_TYPES.SUCCESS,
                message: "הקצאות נשמרו בהצלחה"
            };
        }
        catch (error) {
            await transaction.rollback();
            throw new common_1.BadGatewayException({
                message: error?.response?.message ?? 'נכשלה שמירת ההקצאות, יש לנסות שוב',
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
    }
    async downloadAllocations(date, screenUnitId, username, materialId) {
        const transaction = await this.sequelize.transaction();
        const { formattedTime } = (0, date_1.formatDate)(new Date());
        try {
            const unitDetails = await this.unitRepository.fetchActiveUnitDetails(date, screenUnitId);
            const activeRelations = await this.unitHierarchyService.fetchActiveRelations(date);
            const childIdsByParent = (0, report_service_utils_1.buildChildIdsByParent)(activeRelations);
            const unitLevelById = (0, report_service_utils_1.buildUnitLevelById)(activeRelations);
            const directChildIds = (0, report_aggregate_hierarchy_utils_1.sortNumeric)(childIdsByParent.get(screenUnitId) ?? []);
            const directChildRelations = activeRelations.filter((relation) => relation.unitId === screenUnitId);
            const [existingMatkalOutgoingAllocationReports, currentOutgoingAllocationReports, matkalRequisitionReports] = await Promise.all([
                unitDetails?.unitLevelId === constants_1.UNIT_LEVELS.MATKAL
                    ? this.repository.fetchOutgoingAllocationReports(date, screenUnitId, directChildIds)
                    : Promise.resolve([]),
                this.repository.fetchOutgoingAllocationReports(date, screenUnitId, directChildIds, materialId ? [materialId] : []),
                unitDetails?.unitLevelId === constants_1.UNIT_LEVELS.MATKAL && directChildIds.length > 0
                    ? this.repository.fetchReportsForRecipientsByType(date, constants_1.REPORT_TYPES.REQUEST, [screenUnitId], directChildIds, materialId ? [materialId] : [])
                    : Promise.resolve([])
            ]);
            const allocationChanges = (0, report_allocation_save_utils_1.buildDownloadAllocationChanges)({
                isMatkal: unitDetails?.unitLevelId === constants_1.UNIT_LEVELS.MATKAL,
                outgoingAllocationReports: currentOutgoingAllocationReports,
                requisitionReports: matkalRequisitionReports,
                isDvhExcel: false
            });
            const shouldReturnInitialMatkalDuhExport = unitDetails?.unitLevelId === constants_1.UNIT_LEVELS.MATKAL
                && existingMatkalOutgoingAllocationReports.length === 0;
            if (allocationChanges.length === 0) {
                await transaction.commit();
                return {
                    data: null,
                    type: constants_1.MESSAGE_TYPES.WARNING,
                    message: "אין הקצאות להורדה"
                };
            }
            const allocatedMaterialIds = Array.from(new Set(allocationChanges.map((change) => change.materialId)));
            const grandchildIds = Array.from(new Set(directChildIds.flatMap((childUnitId) => childIdsByParent.get(childUnitId) ?? [])));
            const [incomingAllocationReports, downstreamRequisitionReports] = await Promise.all([
                unitDetails?.unitLevelId === constants_1.UNIT_LEVELS.MATKAL
                    ? Promise.resolve([])
                    : this.repository.fetchIncomingAllocationReports(date, screenUnitId, allocatedMaterialIds),
                directChildIds.length === 0 || grandchildIds.length === 0
                    ? Promise.resolve([])
                    : this.repository.fetchReportsForRecipientsByType(date, constants_1.REPORT_TYPES.REQUEST, directChildIds, grandchildIds, allocatedMaterialIds)
            ]);
            const confirmedAllocationReports = (0, report_allocation_save_utils_1.buildConfirmedAllocationChanges)({
                changes: allocationChanges,
                username,
                creationTime: formattedTime,
                screenUnit: unitDetails,
                screenDate: new Date(date)
            });
            const incomingBalanceUpdates = (0, report_allocation_save_utils_1.buildAllocationBalanceUpdates)({
                allocationChanges,
                incomingAllocationReports,
                username,
                creationTime: formattedTime,
            });
            const nextLevelDraftReports = (0, report_allocation_save_utils_1.buildNextLevelAllocationDraftChanges)({
                changes: allocationChanges,
                childIdsByParent,
                username,
                creationTime: formattedTime,
                screenDate: new Date(date),
                unitLevelById,
                requisitionReports: downstreamRequisitionReports,
            });
            await this.repository.saveReports({
                reportsToSave: [
                    ...confirmedAllocationReports,
                    ...incomingBalanceUpdates,
                ],
                transaction,
                fieldsToUpdate: ["reportedQuantity", "confirmedQuantity", "balanceQuantity"],
            });
            await this.repository.saveReports({
                reportsToSave: nextLevelDraftReports,
                transaction,
                fieldsToUpdate: ["reportedQuantity"],
            });
            const allocationDuhExport = shouldReturnInitialMatkalDuhExport
                ? await this.buildAllocationDuhExport({
                    date,
                    allocationChanges,
                    directChildRelations,
                    outgoingAllocationReports: currentOutgoingAllocationReports,
                    requisitionReports: matkalRequisitionReports,
                })
                : null;
            await transaction.commit();
            return {
                data: {
                    allocationDuhExport,
                },
                type: constants_1.MESSAGE_TYPES.SUCCESS,
                message: "הקצאות הורדו בהצלחה",
            };
        }
        catch (error) {
            await transaction.rollback();
            throw new common_1.BadGatewayException({
                message: error?.response?.message ?? 'נכשלה הורדת ההקצאות, יש לנסות שוב',
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = ReportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [report_repository_1.ReportRepository,
        sequelize_typescript_1.Sequelize,
        unit_hierarchy_service_1.UnitHierarchyService,
        unit_repository_1.UnitRepository])
], ReportService);
//# sourceMappingURL=report.service.js.map