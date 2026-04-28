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
var UnitHierarchyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitHierarchyService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_typescript_1 = require("sequelize-typescript");
const unit_hierarchy_repository_1 = require("./unit-hierarchy.repository");
const hierarchyRecursion_1 = require("./utilities/hierarchyRecursion");
const constants_1 = require("../../../../constants");
const units_statuses_repository_1 = require("../../units-statuses/units-statuses.repository");
const report_routing_repository_1 = require("../../../report-entities/report/report-routing.repository");
const date_1 = require("../../../../utils/date");
const remeda_1 = require("remeda");
const user_repository_1 = require("../../users/user.repository");
const DEFAULT_STATUS = { id: 0, description: "בדיווח" };
const DATE_MISMATCH_ERROR = "לא ניתן לבצע שינוי היררכי על ימים עברו";
const REMOVE_PARENT_LOCKED_ERROR = "יחידה האב נעולה, אין אפשרות למחוק את הקשר";
const TRANSFER_PARENT_LOCKED_ERROR = "יחידה האב נעולה, אין אפשרות להעביר את הקשר";
const SELF_RELATION_ERROR = "לא ניתן לקשר יחידה לעצמה";
const NOT_UNDER_ROOT_UNIT_ERROR = "היחידה שניסית להעביר אינה תחתייך";
const LOWER_LEVEL_ERROR = "לא ניתן להוסיף יחידה לרמה היררכית נמוכה ממנה";
const CREATE_UPPER_NOT_UNDER_ROOT_UNIT_ERROR = "היחידה אליה ניסית להוסיף קשר, אינה תחתייך";
const TRANSFER_UPPER_NOT_UNDER_ROOT_UNIT_ERROR = "היחידה אליה ניסית להעביר את הקשר, אינה תחתייך";
const LOWER_UNIT_HAS_ANOTHER_ACTIVE_RELATION_ERROR = "החידה שניסית להוסיף מקושרת ליחידה אחרת";
const RELATION_ALREADY_EXISTS_ERROR = "הקשר כבר קיים";
const ADD_PARENT_LOCKED_ERROR = "יחידת האב נעולה, אין אפשרות ליצור את הקשר";
let UnitHierarchyService = UnitHierarchyService_1 = class UnitHierarchyService {
    repository;
    sequelize;
    unitStatusTypesRepository;
    reportRoutingRepository;
    unitUserRepository;
    logger = new common_1.Logger(UnitHierarchyService_1.name);
    constructor(repository, sequelize, unitStatusTypesRepository, reportRoutingRepository, unitUserRepository) {
        this.repository = repository;
        this.sequelize = sequelize;
        this.unitStatusTypesRepository = unitStatusTypesRepository;
        this.reportRoutingRepository = reportRoutingRepository;
        this.unitUserRepository = unitUserRepository;
    }
    async getHierarchyForUser(username, date) {
        try {
            const userUnit = await this.unitUserRepository.fetchUnitUser(username);
            const rootUnit = userUnit?.dataValues.unitId;
            if (!(0, remeda_1.isDefined)(rootUnit)) {
                throw new common_1.BadGatewayException({
                    message: 'אינך מקושר ליחידה ארגונית',
                    type: 'Fatal'
                });
            }
            const unitsRelations = await this.repository.fetchActive(date);
            const emergencyUnitIds = (0, hierarchyRecursion_1.getEmergencyUnitIds)(unitsRelations);
            const rootChildren = unitsRelations.filter((relation) => relation?.dataValues?.unitId === rootUnit);
            const hierarchy = (0, hierarchyRecursion_1.getHierarchy)(unitsRelations, rootChildren, emergencyUnitIds);
            const rootNode = (0, hierarchyRecursion_1.getRootUnit)(unitsRelations, rootUnit, emergencyUnitIds);
            if ((0, remeda_1.isEmptyish)(rootNode?.description)) {
                throw new common_1.BadGatewayException({
                    message: 'היחידה שאליה אתה מקושר לא קיימת, יש ליצור קשר עם התמיכה',
                    type: 'Fatal'
                });
            }
            if ((0, remeda_1.isEmptyish)(hierarchy)) {
                throw new common_1.BadGatewayException({
                    message: 'אין היררכיה ליחידה הנתונה',
                    type: 'Fatal'
                });
            }
            const normalized = hierarchy.map((node) => ({
                ...node,
                status: node.status ?? DEFAULT_STATUS,
                parent: node.parent
                    ? {
                        ...node.parent,
                        status: node.parent.status ?? DEFAULT_STATUS,
                    }
                    : null,
            }));
            if (!rootNode)
                return normalized;
            return [
                {
                    ...rootNode,
                    status: rootNode.status ?? DEFAULT_STATUS,
                    parent: null,
                },
                ...normalized,
            ].sort((a, b) => a.level - b.level);
        }
        catch (error) {
            this.logger.error("Failed to fetch hierarchy for user", error instanceof Error ? error.stack : String(error));
            throw error;
        }
    }
    async getAllUnitsWithParents(date) {
        const unitDetails = await this.repository.fetchAllActiveUnitDetails(date);
        if (unitDetails.length === 0)
            return [];
        const uniqueUnitIds = Array.from(new Set(unitDetails.map((detail) => detail.unitId)));
        const [unitStatuses, directParentRelations] = await Promise.all([
            this.repository.fetchUnitStatusesForDate(date, uniqueUnitIds),
            this.repository.fetchDirectParentRelations(date, uniqueUnitIds),
        ]);
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
        const parentByChild = new Map();
        const parentIdsByChild = new Map();
        for (const relation of directParentRelations) {
            if (!parentByChild.has(relation.relatedUnitId)) {
                parentByChild.set(relation.relatedUnitId, relation.unitId);
            }
            const parentIds = parentIdsByChild.get(relation.relatedUnitId) ?? [];
            parentIds.push(relation.unitId);
            parentIdsByChild.set(relation.relatedUnitId, parentIds);
        }
        const emergencyUnitIds = new Set();
        const gdudUnitIds = [];
        for (const unitId of uniqueUnitIds) {
            const level = detailByUnit.get(unitId)?.unitLevelId ?? 0;
            if (level === 4) {
                emergencyUnitIds.add(unitId);
                gdudUnitIds.push(unitId);
            }
        }
        const queue = [...gdudUnitIds];
        while (queue.length > 0) {
            const childId = queue.shift();
            if (!childId)
                continue;
            const parentIds = parentIdsByChild.get(childId) ?? [];
            for (const parentId of parentIds) {
                if (emergencyUnitIds.has(parentId))
                    continue;
                emergencyUnitIds.add(parentId);
                queue.push(parentId);
            }
        }
        const units = uniqueUnitIds.map((unitId) => {
            const detail = detailByUnit.get(unitId);
            const status = statusByUnit.get(unitId)?.unitStatus?.dataValues ?? DEFAULT_STATUS;
            const parentId = parentByChild.get(unitId);
            const parent = parentId
                ? {
                    id: parentId,
                    description: detailByUnit.get(parentId)?.description ?? "",
                    level: detailByUnit.get(parentId)?.unitLevelId ?? 0,
                    simul: detailByUnit.get(parentId)?.tsavIrgunCodeId ?? "",
                    status: statusByUnit.get(parentId)?.unitStatus?.dataValues ?? DEFAULT_STATUS,
                }
                : null;
            return {
                id: unitId,
                description: detail?.description ?? "",
                level: detail?.unitLevelId ?? 0,
                simul: detail?.tsavIrgunCodeId ?? "",
                isEmergencyUnit: emergencyUnitIds.has(unitId),
                status,
                parent,
            };
        });
        return units.sort((a, b) => {
            if (a.level !== b.level)
                return a.level - b.level;
            return a.id - b.id;
        });
    }
    async removeUnitRelation(removeUnitRelationDto, date) {
        const { formattedDate } = (0, date_1.formatDate)(new Date());
        if (date !== formattedDate) {
            throw new common_1.BadRequestException({
                message: DATE_MISMATCH_ERROR,
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
        const { lowerUnit, upperUnit } = removeUnitRelationDto;
        const transaction = await this.sequelize.transaction();
        try {
            if (removeUnitRelationDto.rootUnit !== null) {
                const isUnderRootUnit = await this.repository.isUnitUnderRootUnit(formattedDate, removeUnitRelationDto.rootUnit, lowerUnit, transaction);
                if (!isUnderRootUnit) {
                    throw new common_1.BadRequestException({
                        message: NOT_UNDER_ROOT_UNIT_ERROR,
                        type: constants_1.MESSAGE_TYPES.FAILURE
                    });
                }
            }
            const activeRelation = await this.repository.fetchCurrentParentRelation(lowerUnit, formattedDate, transaction);
            if (!activeRelation || activeRelation.unitId !== upperUnit) {
                throw new common_1.BadRequestException({
                    message: `היחידה ${lowerUnit} כבר לא מקושרת אל היחידה ${upperUnit} יש לרענן את המסך`,
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            const parentUnitStatus = await this.repository.fetchUnitStatusForDate(activeRelation.unitId, formattedDate, transaction);
            const parentStatusId = parentUnitStatus?.unitStatusId ?? constants_1.UNIT_STATUSES.REQUESTING;
            if (parentStatusId !== constants_1.UNIT_STATUSES.REQUESTING) {
                throw new common_1.BadRequestException({
                    message: REMOVE_PARENT_LOCKED_ERROR,
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            const hierarchyUnitIds = await this.unitStatusTypesRepository.fetchHierarchyUnitIds(formattedDate, [lowerUnit], transaction);
            await this.unitStatusTypesRepository.clearStatusesForUnitsDate(hierarchyUnitIds, formattedDate, transaction);
            await this.repository.closeRelationOnDate(activeRelation, formattedDate, transaction);
            await this.reportRoutingRepository.rerouteUnitReportsToParentForDate(lowerUnit, formattedDate, null, null, null, transaction);
            await transaction.commit();
            return { message: "הקשר ההיררכי הוסר בהצלחה", type: constants_1.MESSAGE_TYPES.SUCCESS };
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    async addUnitRelation(addUnitRelationDto, date, username) {
        const { formattedDate } = (0, date_1.formatDate)(new Date());
        if (date !== formattedDate) {
            throw new common_1.BadRequestException({
                message: DATE_MISMATCH_ERROR,
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
        const { lowerUnit, upperUnit } = addUnitRelationDto;
        if (lowerUnit === upperUnit) {
            throw new common_1.BadRequestException({
                message: SELF_RELATION_ERROR,
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
        const transaction = await this.sequelize.transaction();
        try {
            if (addUnitRelationDto.rootUnit === null) {
                throw new common_1.BadRequestException({
                    message: CREATE_UPPER_NOT_UNDER_ROOT_UNIT_ERROR,
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            const isUpperUnitUnderRootUnit = await this.repository.isUnitUnderRootUnit(formattedDate, addUnitRelationDto.rootUnit, upperUnit, transaction);
            if (!isUpperUnitUnderRootUnit) {
                throw new common_1.BadRequestException({
                    message: CREATE_UPPER_NOT_UNDER_ROOT_UNIT_ERROR,
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            const activeRelation = await this.repository.fetchCurrentParentRelation(lowerUnit, formattedDate, transaction);
            if (activeRelation?.unitId === upperUnit) {
                throw new common_1.BadRequestException({
                    message: RELATION_ALREADY_EXISTS_ERROR,
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            const hasOpenRelationWithAnotherUnit = !!activeRelation &&
                activeRelation.unitId !== upperUnit &&
                activeRelation.endDate instanceof Date &&
                activeRelation.endDate.getUTCFullYear() === 9999;
            if (hasOpenRelationWithAnotherUnit) {
                throw new common_1.BadRequestException({
                    message: LOWER_UNIT_HAS_ANOTHER_ACTIVE_RELATION_ERROR,
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            const parentUnitStatus = await this.repository.fetchUnitStatusForDate(upperUnit, formattedDate, transaction);
            const parentStatusId = parentUnitStatus?.unitStatusId ?? constants_1.UNIT_STATUSES.REQUESTING;
            if (parentStatusId !== constants_1.UNIT_STATUSES.REQUESTING) {
                throw new common_1.BadRequestException({
                    message: ADD_PARENT_LOCKED_ERROR,
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            const details = await this.repository.fetchUnitsActiveDetails(formattedDate, [upperUnit, lowerUnit], transaction);
            const detailsByUnit = new Map();
            for (const detail of details) {
                if (!detailsByUnit.has(detail.unitId)) {
                    detailsByUnit.set(detail.unitId, detail.unitLevelId);
                }
            }
            const upperUnitLevel = detailsByUnit.get(upperUnit) ?? 0;
            const lowerUnitLevel = detailsByUnit.get(lowerUnit) ?? 0;
            if (upperUnitLevel > lowerUnitLevel) {
                throw new common_1.BadRequestException({
                    message: LOWER_LEVEL_ERROR,
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            if (activeRelation) {
                await this.repository.closeRelationOnDate(activeRelation, formattedDate, transaction);
            }
            await this.repository.createParentRelation(upperUnit, lowerUnit, formattedDate, transaction);
            await this.reportRoutingRepository.rerouteUnitReportsToParentForDate(lowerUnit, formattedDate, upperUnit, addUnitRelationDto.rootUnit, username, transaction);
            await transaction.commit();
            return { message: "הקשר ההיררכי נוסף בהצלחה", type: constants_1.MESSAGE_TYPES.SUCCESS };
        }
        catch (error) {
            this.logger.error("Failed to add unit relation", error instanceof Error ? error.stack : String(error));
            await transaction.rollback();
            throw error;
        }
    }
    async transferUnitRelation(transferUnitRelationDto, date, username) {
        const { formattedDate } = (0, date_1.formatDate)(new Date());
        if (date !== formattedDate) {
            throw new common_1.BadRequestException({
                message: DATE_MISMATCH_ERROR,
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
        const { lowerUnit, upperUnit } = transferUnitRelationDto;
        if (lowerUnit === upperUnit) {
            throw new common_1.BadRequestException({
                message: SELF_RELATION_ERROR,
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
        const transaction = await this.sequelize.transaction();
        try {
            const [isLowerUnderRootUnit, isUpperUnitUnderRootUnit] = await Promise.all([
                this.repository.isUnitUnderRootUnit(formattedDate, transferUnitRelationDto.rootUnit, lowerUnit, transaction),
                this.repository.isUnitUnderRootUnit(formattedDate, transferUnitRelationDto.rootUnit, upperUnit, transaction),
            ]);
            if (!isLowerUnderRootUnit) {
                throw new common_1.BadRequestException({
                    message: NOT_UNDER_ROOT_UNIT_ERROR,
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            if (!isUpperUnitUnderRootUnit) {
                throw new common_1.BadRequestException({
                    message: TRANSFER_UPPER_NOT_UNDER_ROOT_UNIT_ERROR,
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            const activeRelation = await this.repository.fetchCurrentParentRelation(lowerUnit, formattedDate, transaction);
            if (activeRelation?.unitId === upperUnit) {
                throw new common_1.BadRequestException({
                    message: RELATION_ALREADY_EXISTS_ERROR,
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            if (activeRelation) {
                const currentParentUnitStatus = await this.repository.fetchUnitStatusForDate(activeRelation.unitId, formattedDate, transaction);
                const currentParentStatusId = currentParentUnitStatus?.unitStatusId ?? constants_1.UNIT_STATUSES.REQUESTING;
                if (currentParentStatusId !== constants_1.UNIT_STATUSES.REQUESTING) {
                    throw new common_1.BadRequestException({
                        message: TRANSFER_PARENT_LOCKED_ERROR,
                        type: constants_1.MESSAGE_TYPES.FAILURE
                    });
                }
            }
            const parentUnitStatus = await this.repository.fetchUnitStatusForDate(upperUnit, formattedDate, transaction);
            const parentStatusId = parentUnitStatus?.unitStatusId ?? constants_1.UNIT_STATUSES.REQUESTING;
            if (parentStatusId !== constants_1.UNIT_STATUSES.REQUESTING) {
                throw new common_1.BadRequestException({
                    message: ADD_PARENT_LOCKED_ERROR,
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            const details = await this.repository.fetchUnitsActiveDetails(formattedDate, [upperUnit, lowerUnit], transaction);
            const detailsByUnit = new Map();
            for (const detail of details) {
                if (!detailsByUnit.has(detail.unitId)) {
                    detailsByUnit.set(detail.unitId, detail.unitLevelId);
                }
            }
            const upperUnitLevel = detailsByUnit.get(upperUnit) ?? 0;
            const lowerUnitLevel = detailsByUnit.get(lowerUnit) ?? 0;
            if (upperUnitLevel > lowerUnitLevel) {
                throw new common_1.BadRequestException({
                    message: LOWER_LEVEL_ERROR,
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            if (activeRelation) {
                await this.repository.closeRelationOnDate(activeRelation, formattedDate, transaction);
            }
            await this.repository.createParentRelation(upperUnit, lowerUnit, formattedDate, transaction);
            const hierarchyUnitIds = await this.unitStatusTypesRepository.fetchHierarchyUnitIds(formattedDate, [lowerUnit], transaction);
            await this.unitStatusTypesRepository.clearStatusesForUnitsDate(hierarchyUnitIds, formattedDate, transaction);
            await this.reportRoutingRepository.rerouteUnitReportsToParentForDate(lowerUnit, formattedDate, upperUnit, transferUnitRelationDto.rootUnit, username, transaction);
            await transaction.commit();
            return { message: "הקשר ההיררכי הועבר בהצלחה", type: constants_1.MESSAGE_TYPES.SUCCESS };
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    async fetchLowerUnits(date, unitId) {
        return await this.repository.fetchActive(date, unitId);
    }
    async fetchActiveRelations(date) {
        return this.repository.fetchActive(date);
    }
    buildEmergencyUnitLookup(relations) {
        const lookup = {};
        for (const unitId of (0, hierarchyRecursion_1.getEmergencyUnitIds)(relations)) {
            lookup[unitId] = true;
        }
        return lookup;
    }
};
exports.UnitHierarchyService = UnitHierarchyService;
exports.UnitHierarchyService = UnitHierarchyService = UnitHierarchyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [unit_hierarchy_repository_1.UnitHierarchyRepository,
        sequelize_typescript_1.Sequelize,
        units_statuses_repository_1.UnitStatusRepository,
        report_routing_repository_1.ReportRoutingRepository,
        user_repository_1.UserRepository])
], UnitHierarchyService);
//# sourceMappingURL=unit-hierarchy.service.js.map