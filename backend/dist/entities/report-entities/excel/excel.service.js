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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelService = void 0;
const common_1 = require("@nestjs/common");
const decimal_js_1 = __importDefault(require("decimal.js"));
const promises_1 = require("fs/promises");
const path_1 = require("path");
const constants_1 = require("../../../constants");
const material_repository_1 = require("../../material-entities/material/material.repository");
const unit_hierarchy_repository_1 = require("../../unit-entities/features/unit-hierarchy/unit-hierarchy.repository");
const report_repository_1 = require("../report/report.repository");
const report_service_1 = require("../report/report.service");
const SUPPORTED_REPORT_TYPES = new Set([
    constants_1.REPORT_TYPES.REQUEST,
    constants_1.REPORT_TYPES.INVENTORY,
    constants_1.REPORT_TYPES.USAGE,
]);
const DEFAULT_FAILURE_MESSAGE = "נמצאו שגיאות בייבוא האקסל";
const SCREEN_UNIT_NOT_FOUND_MESSAGE = "יחידת המסך לא קיימת במערכת";
const UNSUPPORTED_REPORT_TYPE_MESSAGE = "סוג הדיווח אינו נתמך בייבוא האקסל";
const MATERIAL_NOT_FOUND_MESSAGE = "המק\"ט לא קיים במערכת";
const MATERIAL_INACTIVE_MESSAGE = "המק\"ט אינו פעיל";
const QUANTITY_MUST_BE_POSITIVE_MESSAGE = "הכמות חייבת להיות גדולה מ-0";
const UNIT_NOT_FOUND_MESSAGE = "היחידה לא קיימת במערכת";
const SCREEN_ROWS_OUTSIDE_SCREEN_UNIT_MESSAGE = "נתוני המסך מכילים יחידות שאינן תחת יחידת המסך";
const UNIT_OUTSIDE_OPEN_BRANCHES_MESSAGE = "היחידה אינה תחת הילדים הפתוחים של יחידת המסך";
const UNIT_STATUS_INVALID_MESSAGE = "היחידה חייבת להיות בסטטוס ממתין להקצאה";
const INVENTORY_USAGE_LEVEL_MESSAGE = "עבור מלאי ושימוש ניתן לייבא רק יחידות ברמת גדוד";
const REQUEST_LEVEL_MESSAGE = "עבור דרישה היחידה חייבת להיות נמוכה מיחידת המסך";
const TEMPLATE_FILE_NAME = "template.xlsm";
const TEMPLATE_MIME_TYPE = "application/vnd.ms-excel.sheet.macroEnabled.12";
let ExcelService = class ExcelService {
    materialRepository;
    reportRepository;
    unitHierarchyRepository;
    reportService;
    constructor(materialRepository, reportRepository, unitHierarchyRepository, reportService) {
        this.materialRepository = materialRepository;
        this.reportRepository = reportRepository;
        this.unitHierarchyRepository = unitHierarchyRepository;
        this.reportService = reportService;
    }
    async downloadTemplate() {
        const templatePath = (0, path_1.join)(__dirname, TEMPLATE_FILE_NAME);
        const buffer = await (0, promises_1.readFile)(templatePath);
        return {
            buffer,
            fileName: TEMPLATE_FILE_NAME,
            mimeType: TEMPLATE_MIME_TYPE,
        };
    }
    async exportAllocationDuh(date, screenUnitId, materialId) {
        const data = await this.reportService.fetchAllocationDuhExport(date, screenUnitId, materialId);
        if (!data) {
            return {
                data: null,
                message: "אין הקצאות לייצוא",
                type: constants_1.MESSAGE_TYPES.WARNING,
            };
        }
        return {
            data,
            message: "אקסל הקצאה דו״ה הופק בהצלחה",
            type: constants_1.MESSAGE_TYPES.SUCCESS,
        };
    }
    async importExcelRows(date, screenUnitId, excelImportBody) {
        const excelRows = excelImportBody.excelRows ?? [];
        if (excelRows.length === 0) {
            return this.buildResponse([], []);
        }
        const screenRows = excelImportBody?.screenRows ?? [];
        const materialIds = Array.from(new Set([
            ...excelRows.map((row) => row.materialId),
            ...screenRows.map((row) => row.materialId),
        ]));
        const unitSimuls = Array.from(new Set(excelRows.map((row) => row.unitSimul).filter(Boolean)));
        const screenRowUnitIds = Array.from(new Set([
            screenUnitId,
            ...screenRows.map((row) => row.unitId).filter((unitId) => Number.isFinite(unitId)),
        ]));
        const [materials, unitLookupRows, activeRelations] = await Promise.all([
            this.materialRepository.fetchMaterialsForExcelImport(materialIds),
            this.unitHierarchyRepository.fetchUnitsForExcelImport(date, {
                unitIds: screenRowUnitIds,
                unitSimuls,
            }),
            this.unitHierarchyRepository.fetchActive(date),
        ]);
        const materialById = this.buildMaterialByIdMap(materials);
        const importScope = this.buildImportScope(screenUnitId, unitLookupRows, activeRelations);
        const screenUnit = importScope.unitById.get(screenUnitId);
        if (!screenUnit) {
            throw new common_1.BadRequestException({
                message: SCREEN_UNIT_NOT_FOUND_MESSAGE,
                type: constants_1.MESSAGE_TYPES.FAILURE,
            });
        }
        this.validateScreenRows(screenRows, importScope, screenUnitId);
        const { validRows, failures } = this.validateExcelRows(excelRows, materialById, importScope, screenUnit);
        if (validRows.length === 0) {
            return this.buildResponse([], failures);
        }
        const combinedValidRows = this.combineDuplicateExcelRows(validRows);
        const affectedMaterialsByReportType = this.buildAffectedMaterialsByReportType(combinedValidRows);
        const affectedReportTypes = Array.from(affectedMaterialsByReportType.keys()).sort((left, right) => left - right);
        const dbUnitIds = this.collectDbUnitIds(affectedReportTypes, importScope);
        const dbMaterialIds = Array.from(new Set(combinedValidRows.map((row) => row.materialId)));
        const dbRows = await this.reportRepository.fetchActiveReportItemQuantitiesByUnitMaterialAndType(date, affectedReportTypes, dbMaterialIds, dbUnitIds);
        const flatChanges = this.buildChanges({
            validRows: combinedValidRows,
            screenRows,
            dbRows,
            affectedMaterialsByReportType,
            importScope,
            screenUnitId,
        });
        const changes = this.buildReportFetchLikeChanges(flatChanges, materialById, importScope);
        return this.buildResponse(changes, failures);
    }
    combineDuplicateExcelRows(excelRows) {
        const rowsByKey = new Map();
        for (const row of excelRows) {
            const rowKey = this.buildExcelDuplicateKey(row);
            const existing = rowsByKey.get(rowKey);
            if (!existing) {
                rowsByKey.set(rowKey, { ...row });
                continue;
            }
            existing.quantity += row.quantity;
            existing.rowNumber = Math.min(existing.rowNumber, row.rowNumber);
        }
        return Array.from(rowsByKey.values()).sort((left, right) => left.rowNumber - right.rowNumber);
    }
    buildMaterialByIdMap(materials) {
        const materialById = new Map();
        for (const material of materials) {
            materialById.set(material.id, {
                id: material.id,
                description: material.description,
                multiply: Number(material.multiply),
                recordStatus: material.recordStatus,
                unitOfMeasurement: material.unitOfMeasurement,
                nickname: material.nickname,
                materialCategory: material.materialCategory,
            });
        }
        return materialById;
    }
    buildImportScope(screenUnitId, unitLookupRows, activeRelations) {
        const unitById = new Map();
        const childrenByParent = new Map();
        const parentsByChild = new Map();
        for (const unitLookupRow of unitLookupRows) {
            this.upsertUnitSnapshot(unitById, {
                unitId: unitLookupRow.unitId,
                description: unitLookupRow.description ?? "",
                level: unitLookupRow.unitLevelId ?? 0,
                simul: unitLookupRow.simul ?? "",
                statusId: unitLookupRow.statusId,
                statusDescription: unitLookupRow.statusDescription ?? "",
            });
        }
        for (const relation of activeRelations) {
            const parentId = relation.unitId;
            const childId = relation.relatedUnitId;
            childrenByParent.set(parentId, [
                ...(childrenByParent.get(parentId) ?? []),
                childId,
            ]);
            parentsByChild.set(childId, [
                ...(parentsByChild.get(childId) ?? []),
                parentId,
            ]);
            this.upsertUnitSnapshot(unitById, this.buildHierarchyUnitSnapshotFromRelationSource(parentId, relation.unit));
            this.upsertUnitSnapshot(unitById, this.buildHierarchyUnitSnapshotFromRelationSource(childId, relation.relatedUnit));
        }
        const descendantUnitIds = new Set();
        const descendantQueue = [...this.sortNumeric(childrenByParent.get(screenUnitId) ?? [])];
        while (descendantQueue.length > 0) {
            const currentUnitId = descendantQueue.shift();
            if (currentUnitId === undefined || descendantUnitIds.has(currentUnitId))
                continue;
            descendantUnitIds.add(currentUnitId);
            for (const childUnitId of childrenByParent.get(currentUnitId) ?? []) {
                if (descendantUnitIds.has(childUnitId))
                    continue;
                descendantQueue.push(childUnitId);
            }
        }
        const directChildIds = this.sortNumeric(childrenByParent.get(screenUnitId) ?? []);
        const openDirectChildIds = directChildIds.filter((childUnitId) => (unitById.get(childUnitId)?.statusId ?? 0) === constants_1.UNIT_STATUSES.WAITING_FOR_ALLOCATION);
        const includedUnitIds = new Set([screenUnitId]);
        const queue = [...openDirectChildIds];
        while (queue.length > 0) {
            const currentUnitId = queue.shift();
            if (currentUnitId === undefined || includedUnitIds.has(currentUnitId))
                continue;
            includedUnitIds.add(currentUnitId);
            for (const childUnitId of childrenByParent.get(currentUnitId) ?? []) {
                if (includedUnitIds.has(childUnitId))
                    continue;
                queue.push(childUnitId);
            }
        }
        const includedUnitIdsSorted = this.sortNumeric(Array.from(includedUnitIds));
        const parentByChild = new Map();
        for (const unitId of includedUnitIdsSorted) {
            if (unitId === screenUnitId)
                continue;
            const directParentId = this.sortNumeric((parentsByChild.get(unitId) ?? []).filter((parentUnitId) => includedUnitIds.has(parentUnitId)))[0];
            if (directParentId !== undefined) {
                parentByChild.set(unitId, directParentId);
            }
        }
        const unitBySimul = new Map();
        for (const unit of unitById.values()) {
            if (!unit.simul || unitBySimul.has(unit.simul))
                continue;
            unitBySimul.set(unit.simul, unit);
        }
        const lowerUnitIds = includedUnitIdsSorted.filter((unitId) => unitId !== screenUnitId);
        const gdudUnitIds = lowerUnitIds.filter((unitId) => (unitById.get(unitId)?.level ?? -1) === constants_1.UNIT_LEVELS.GDUD);
        return {
            unitById,
            unitBySimul,
            parentByChild,
            descendantUnitIds: this.sortNumeric(Array.from(descendantUnitIds)),
            includedUnitIds: includedUnitIdsSorted,
            lowerUnitIds,
            gdudUnitIds,
        };
    }
    validateScreenRows(screenRows, importScope, screenUnitId) {
        const descendantUnitIds = new Set(importScope.descendantUnitIds);
        const invalidUnitIds = this.sortNumeric(Array.from(new Set(screenRows
            .map((row) => row.unitId)
            .filter((unitId) => !descendantUnitIds.has(unitId) || unitId === screenUnitId))));
        if (invalidUnitIds.length === 0)
            return;
        throw new common_1.BadRequestException({
            message: `${SCREEN_ROWS_OUTSIDE_SCREEN_UNIT_MESSAGE}: ${invalidUnitIds.join(", ")}`,
            type: constants_1.MESSAGE_TYPES.FAILURE,
        });
    }
    validateExcelRows(excelRows, materialById, importScope, screenUnit) {
        const validRows = [];
        const failures = [];
        const includedUnitIds = new Set(importScope.includedUnitIds);
        for (const row of excelRows) {
            const material = materialById.get(row.materialId);
            const unit = importScope.unitBySimul.get(row.unitSimul);
            let errorMessage = "";
            if (!SUPPORTED_REPORT_TYPES.has(row.reportType)) {
                errorMessage = UNSUPPORTED_REPORT_TYPE_MESSAGE;
            }
            else if (!material) {
                errorMessage = MATERIAL_NOT_FOUND_MESSAGE;
            }
            else if (material.recordStatus !== constants_1.RECORD_STATUS.ACTIVE) {
                errorMessage = MATERIAL_INACTIVE_MESSAGE;
            }
            else if (row.quantity < 0) {
                errorMessage = QUANTITY_MUST_BE_POSITIVE_MESSAGE;
            }
            else if (!unit) {
                errorMessage = UNIT_NOT_FOUND_MESSAGE;
            }
            else if (!includedUnitIds.has(unit.unitId) || unit.unitId === screenUnit.unitId) {
                errorMessage = UNIT_OUTSIDE_OPEN_BRANCHES_MESSAGE;
            }
            else if (unit.statusId !== constants_1.UNIT_STATUSES.WAITING_FOR_ALLOCATION) {
                errorMessage = UNIT_STATUS_INVALID_MESSAGE;
            }
            else if ((row.reportType === constants_1.REPORT_TYPES.INVENTORY || row.reportType === constants_1.REPORT_TYPES.USAGE) &&
                unit.level !== constants_1.UNIT_LEVELS.GDUD) {
                errorMessage = INVENTORY_USAGE_LEVEL_MESSAGE;
            }
            else if (row.reportType === constants_1.REPORT_TYPES.REQUEST && unit.level <= screenUnit.level) {
                errorMessage = REQUEST_LEVEL_MESSAGE;
            }
            if (errorMessage) {
                failures.push(this.buildFailure(row, errorMessage, material, unit));
                continue;
            }
            validRows.push({
                ...row,
                unitId: unit.unitId,
            });
        }
        return {
            validRows,
            failures: failures
        };
    }
    buildAffectedMaterialsByReportType(validRows) {
        const materialsByReportType = new Map();
        for (const row of validRows) {
            const materials = materialsByReportType.get(row.reportType) ?? new Set();
            materials.add(row.materialId);
            materialsByReportType.set(row.reportType, materials);
        }
        return materialsByReportType;
    }
    collectDbUnitIds(reportTypes, importScope) {
        const unitIds = new Set();
        for (const reportType of reportTypes) {
            for (const unitId of this.getBaseUnitIdsForReportType(reportType, importScope)) {
                unitIds.add(unitId);
            }
        }
        return this.sortNumeric(Array.from(unitIds));
    }
    buildChanges({ validRows, screenRows, dbRows, affectedMaterialsByReportType, importScope, screenUnitId, }) {
        const excelQuantityByKey = new Map();
        const screenQuantityByKey = new Map();
        const dbQuantityByKey = new Map();
        for (const row of validRows) {
            excelQuantityByKey.set(this.buildUnitMaterialReportKey(row.reportType, row.unitId, row.materialId), row.quantity);
        }
        for (const row of screenRows) {
            screenQuantityByKey.set(this.buildUnitMaterialReportKey(row.reportType, row.unitId, row.materialId), row.quantity);
        }
        for (const row of dbRows) {
            dbQuantityByKey.set(this.buildUnitMaterialReportKey(row.reportTypeId, row.unitId, row.materialId), row.quantity);
        }
        const aggregatedChangeByKey = new Map();
        for (const [reportType, materialIds] of affectedMaterialsByReportType.entries()) {
            const baseUnitIds = this.getBaseUnitIdsForReportType(reportType, importScope);
            for (const materialId of materialIds) {
                for (const baseUnitId of baseUnitIds) {
                    const quantityKey = this.buildUnitMaterialReportKey(reportType, baseUnitId, materialId);
                    const quantity = excelQuantityByKey.get(quantityKey)
                        ?? screenQuantityByKey.get(quantityKey)
                        ?? dbQuantityByKey.get(quantityKey)
                        ?? 0;
                    if (!(quantity > 0))
                        continue;
                    this.upsertChange(aggregatedChangeByKey, reportType, baseUnitId, materialId, quantity);
                    let currentParentId = importScope.parentByChild.get(baseUnitId);
                    while (currentParentId !== undefined) {
                        if (currentParentId === screenUnitId)
                            break;
                        this.upsertChange(aggregatedChangeByKey, reportType, currentParentId, materialId, quantity);
                        currentParentId = importScope.parentByChild.get(currentParentId);
                    }
                }
            }
        }
        return Array.from(aggregatedChangeByKey.values()).sort((left, right) => {
            if (left.reportType !== right.reportType) {
                return left.reportType - right.reportType;
            }
            if (left.unitId !== right.unitId) {
                return left.unitId - right.unitId;
            }
            return left.materialId.localeCompare(right.materialId);
        });
    }
    buildFailure(row, errorMessage, material, unit) {
        return {
            reportType: Number.isFinite(row.reportType) ? row.reportType : -1,
            materialId: row.materialId,
            unitSimul: row.unitSimul,
            quantity: Number.isFinite(row.quantity) ? row.quantity : 0,
            materialDesc: material?.description ?? "",
            unitDesc: unit?.description ?? "",
            rowNumber: Number.isFinite(row.rowNumber) ? row.rowNumber : 0,
            errorMessage,
        };
    }
    buildReportFetchLikeChanges(changes, materialById, importScope) {
        const itemsByMaterial = new Map();
        for (const change of changes) {
            let byUnit = itemsByMaterial.get(change.materialId);
            if (!byUnit) {
                byUnit = new Map();
                itemsByMaterial.set(change.materialId, byUnit);
            }
            let unitItem = byUnit.get(change.unitId);
            if (!unitItem) {
                unitItem = {
                    unit: this.buildUnitDto(change.unitId, importScope),
                    allocatedQuantity: null,
                    types: [],
                };
                byUnit.set(change.unitId, unitItem);
            }
            unitItem.types.push(this.buildReportItemTypeDto(change));
        }
        return Array.from(itemsByMaterial.entries())
            .map(([materialId, byUnit]) => ({
            material: this.buildMaterialDto(materialId, materialById.get(materialId)),
            comments: [],
            receivedAllocationQuantity: null,
            quantityLeftToAllocate: null,
            items: Array.from(byUnit.values())
                .map((item) => ({
                ...item,
                types: item.types.sort((left, right) => left.id - right.id),
            }))
                .sort((left, right) => left.unit.id - right.unit.id),
        }))
            .sort((left, right) => left.material.id.localeCompare(right.material.id));
    }
    buildMaterialDto(materialId, material) {
        return {
            id: materialId,
            description: material?.description ?? "",
            multiply: Number(material?.multiply ?? 0),
            nickname: material?.nickname?.nickname ?? "",
            category: material?.materialCategory?.mainCategory?.description ?? "",
            unitOfMeasure: material?.unitOfMeasurement ?? "",
            type: constants_1.MATERIAL_TYPES.ITEM,
        };
    }
    buildUnitDto(unitId, importScope) {
        const unit = importScope.unitById.get(unitId);
        const parentUnitId = importScope.parentByChild.get(unitId);
        const parent = parentUnitId ? this.buildParentUnitDto(parentUnitId, importScope) : null;
        return {
            id: unitId,
            description: unit?.description ?? "",
            level: unit?.level ?? 0,
            simul: unit?.simul ?? "",
            parent,
            status: {
                id: unit?.statusId ?? 0,
                description: unit?.statusDescription ?? "",
            },
        };
    }
    buildParentUnitDto(unitId, importScope) {
        const unit = importScope.unitById.get(unitId);
        return {
            id: unitId,
            description: unit?.description ?? "",
            level: unit?.level ?? 0,
            simul: unit?.simul ?? "",
            parent: null,
            status: {
                id: unit?.statusId ?? 0,
                description: unit?.statusDescription ?? "",
            },
        };
    }
    buildReportItemTypeDto(change) {
        return {
            id: change.reportType,
            quantity: change.quantity,
            availableQuantityToEat: 0,
            yesterdayInventoryQuantity: change.reportType === constants_1.REPORT_TYPES.INVENTORY ? 0 : null,
            comment: "",
            status: constants_1.RECORD_STATUS.ACTIVE,
        };
    }
    buildResponse(changes, failures) {
        if (changes.length === 0 && failures.length === 0) {
            return {
                message: 'לא הועלה אקסל',
                type: constants_1.MESSAGE_TYPES.FAILURE
            };
        }
        if (changes.length === 0 && failures.length > 0) {
            return {
                data: { changes, failures },
                message: "האקסל לא הועלה, מורד אקסל שגויים",
                type: constants_1.MESSAGE_TYPES.FAILURE,
            };
        }
        if (changes.length > 0 && failures.length > 0) {
            return {
                data: { changes, failures },
                message: "האקסל עלה עם שגיאות, יש להסתכל על האקסל שגויים",
                type: constants_1.MESSAGE_TYPES.WARNING,
            };
        }
        return {
            data: { changes, failures },
            message: changes.length > 0 ? "האקסל הועלה בהצלחה" : DEFAULT_FAILURE_MESSAGE,
            type: changes.length > 0 ? constants_1.MESSAGE_TYPES.SUCCESS : constants_1.MESSAGE_TYPES.FAILURE,
        };
    }
    buildExcelDuplicateKey(row) {
        return `${row.reportType}:${row.unitSimul}:${row.materialId}`;
    }
    buildUnitMaterialReportKey(reportType, unitId, materialId) {
        return `${reportType}:${unitId}:${materialId}`;
    }
    upsertChange(aggregatedChangeByKey, reportType, unitId, materialId, quantity) {
        const changeKey = this.buildUnitMaterialReportKey(reportType, unitId, materialId);
        const existing = aggregatedChangeByKey.get(changeKey);
        if (existing) {
            existing.quantity += quantity;
            return;
        }
        aggregatedChangeByKey.set(changeKey, {
            reportType,
            materialId,
            unitId,
            quantity,
        });
    }
    getBaseUnitIdsForReportType(reportType, importScope) {
        if (reportType === constants_1.REPORT_TYPES.REQUEST) {
            return importScope.lowerUnitIds;
        }
        if (reportType === constants_1.REPORT_TYPES.INVENTORY || reportType === constants_1.REPORT_TYPES.USAGE) {
            return importScope.gdudUnitIds;
        }
        return [];
    }
    isQuantityInMaterialMultiples(quantity, multiply) {
        return new decimal_js_1.default(quantity).modulo(new decimal_js_1.default(multiply)).isZero();
    }
    buildHierarchyUnitSnapshotFromRelationSource(unitId, source) {
        const detail = source?.activeDetail?.dataValues ?? source?.details?.[0]?.dataValues;
        const status = source?.unitStatus?.[0]?.unitStatus;
        const statusValues = status?.dataValues ?? {
            id: status?.id ?? 0,
            description: status?.description ?? "",
        };
        return {
            unitId,
            description: detail?.description ?? "",
            level: detail?.unitLevelId ?? 0,
            simul: detail?.tsavIrgunCodeId ?? "",
            statusId: statusValues.id ?? 0,
            statusDescription: statusValues.description ?? "",
        };
    }
    upsertUnitSnapshot(unitById, snapshot) {
        const existing = unitById.get(snapshot.unitId);
        if (!existing) {
            unitById.set(snapshot.unitId, snapshot);
            return;
        }
        unitById.set(snapshot.unitId, {
            unitId: snapshot.unitId,
            description: existing.description || snapshot.description,
            level: existing.level || snapshot.level,
            simul: existing.simul || snapshot.simul,
            statusId: existing.statusId || snapshot.statusId,
            statusDescription: existing.statusDescription || snapshot.statusDescription,
        });
    }
    sortNumeric(values) {
        return Array.from(new Set(values)).sort((left, right) => left - right);
    }
};
exports.ExcelService = ExcelService;
exports.ExcelService = ExcelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [material_repository_1.MaterialRepository,
        report_repository_1.ReportRepository,
        unit_hierarchy_repository_1.UnitHierarchyRepository,
        report_service_1.ReportService])
], ExcelService);
//# sourceMappingURL=excel.service.js.map