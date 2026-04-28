"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAllocationBalanceUpdates = exports.buildNextLevelAllocationDraftChanges = exports.buildConfirmedAllocationChanges = exports.buildAllocationsChanges = exports.buildDownloadAllocationChanges = exports.buildAllocationChangesFromReports = exports.buildAllocationChangesFromRequisitionReports = exports.mergeMatkalRequisitionAllocations = void 0;
const constants_1 = require("../../../../constants");
const date_1 = require("../../../../utils/date");
const toNumber = (value) => {
    const parsed = Number(value ?? 0);
    return Number.isNaN(parsed) ? 0 : parsed;
};
const buildBaseItem = (username, creationTime, modifiedAt) => ({
    status: constants_1.RECORD_STATUS.ACTIVE,
    changedBy: username,
    changedAt: creationTime,
    modifiedAt,
});
const buildHeader = (unitId, recipientUnitId, username, creationTime, screenDate) => ({
    reportTypeId: constants_1.REPORT_TYPES.ALLOCATION,
    unitId,
    recipientUnitId,
    reporterUnitId: unitId,
    createdOn: screenDate,
    createdBy: username,
    createdAt: creationTime
});
const mergeMatkalRequisitionAllocations = (changes, requisitionReports) => {
    const merged = new Map();
    for (const change of changes) {
        merged.set(`${change.unitId}:${change.materialId}`, change);
    }
    for (const report of requisitionReports) {
        for (const item of report.items ?? []) {
            if (!item.materialId)
                continue;
            const key = `${report.unitId}:${item.materialId}`;
            if (merged.has(key))
                continue;
            merged.set(key, {
                unitId: report.unitId,
                materialId: item.materialId,
                quantity: toNumber(item.confirmedQuantity ?? item.reportedQuantity),
            });
        }
    }
    return Array.from(merged.values());
};
exports.mergeMatkalRequisitionAllocations = mergeMatkalRequisitionAllocations;
const buildAllocationChangesFromRequisitionReports = (requisitionReports) => {
    const changesByKey = new Map();
    for (const report of requisitionReports) {
        for (const item of report.items ?? []) {
            if (!item.materialId)
                continue;
            const quantity = toNumber(item.confirmedQuantity ?? item.reportedQuantity);
            if (quantity !== 0) {
                const key = `${report.unitId}:${item.materialId}`;
                changesByKey.set(key, {
                    unitId: report.unitId,
                    materialId: item.materialId,
                    quantity,
                });
            }
        }
    }
    return Array.from(changesByKey.values());
};
exports.buildAllocationChangesFromRequisitionReports = buildAllocationChangesFromRequisitionReports;
const buildAllocationChangesFromReports = (reports, isDvhExcel) => {
    const changesByKey = new Map();
    for (const report of reports) {
        for (const item of report.items ?? []) {
            if (!item.materialId || report.recipientUnitId === null)
                continue;
            const quantity = isDvhExcel
                ? toNumber(item.confirmedQuantity)
                : toNumber(item.reportedQuantity);
            if (isDvhExcel || quantity !== 0) {
                const key = `${report.recipientUnitId}:${item.materialId}`;
                changesByKey.set(key, {
                    unitId: report.recipientUnitId,
                    materialId: item.materialId,
                    quantity,
                    existingConfirmedQuantity: toNumber(item.confirmedQuantity),
                    existingBalanceQuantity: toNumber(item.balanceQuantity),
                });
            }
        }
    }
    return Array.from(changesByKey.values());
};
exports.buildAllocationChangesFromReports = buildAllocationChangesFromReports;
const buildDownloadAllocationChanges = ({ isMatkal, outgoingAllocationReports, requisitionReports, isDvhExcel }) => {
    if (!isMatkal) {
        return (0, exports.buildAllocationChangesFromReports)(outgoingAllocationReports, isDvhExcel);
    }
    if (outgoingAllocationReports.length > 0) {
        return (0, exports.buildAllocationChangesFromReports)(outgoingAllocationReports, isDvhExcel);
    }
    return (0, exports.buildAllocationChangesFromRequisitionReports)(requisitionReports);
};
exports.buildDownloadAllocationChanges = buildDownloadAllocationChanges;
const buildAllocationsChanges = ({ changes, username, creationTime, screenUnit, screenDate }) => {
    const reportsByKey = new Map();
    const modifiedAt = (0, date_1.combineDateAndTime)(new Date(), creationTime);
    for (const change of changes) {
        const key = `${change.unitId}`;
        if (!reportsByKey.has(key)) {
            reportsByKey.set(key, {
                header: buildHeader(screenUnit.unitId, change.unitId, username, creationTime, screenDate),
                items: []
            });
        }
        reportsByKey.get(key)?.items.push({
            materialId: change.materialId,
            reportedQuantity: change.quantity,
            reportingLevel: screenUnit.unitLevelId,
            reportingUnitId: screenUnit.unitId,
            ...buildBaseItem(username, creationTime, modifiedAt),
        });
    }
    return Array.from(reportsByKey.values());
};
exports.buildAllocationsChanges = buildAllocationsChanges;
const buildConfirmedAllocationChanges = ({ changes, username, creationTime, screenUnit, screenDate }) => {
    const reportsByKey = new Map();
    const modifiedAt = (0, date_1.combineDateAndTime)(new Date(), creationTime);
    for (const change of changes) {
        const key = `${change.unitId}`;
        const existing = reportsByKey.get(key);
        if (!existing) {
            reportsByKey.set(key, {
                header: buildHeader(screenUnit.unitId, change.unitId, username, creationTime, screenDate),
                items: []
            });
        }
        reportsByKey.get(key)?.items.push({
            materialId: change.materialId,
            reportedQuantity: 0,
            confirmedQuantity: (change.existingConfirmedQuantity ?? 0) + change.quantity,
            balanceQuantity: (change.existingBalanceQuantity ?? 0) + change.quantity,
            reportingLevel: screenUnit.unitLevelId,
            reportingUnitId: screenUnit.unitId,
            ...buildBaseItem(username, creationTime, modifiedAt),
        });
    }
    return Array.from(reportsByKey.values());
};
exports.buildConfirmedAllocationChanges = buildConfirmedAllocationChanges;
const buildNextLevelAllocationDraftChanges = ({ childIdsByParent, changes, username, creationTime, screenDate, unitLevelById, requisitionReports, }) => {
    const reportsByKey = new Map();
    const handledChildMaterial = new Set();
    const modifiedAt = (0, date_1.combineDateAndTime)(new Date(), creationTime);
    const requisitionByRecipientChildMaterial = new Map();
    for (const report of requisitionReports) {
        for (const item of report.items ?? []) {
            if (!item.materialId)
                continue;
            const key = `${report.recipientUnitId}:${report.unitId}:${item.materialId}`;
            requisitionByRecipientChildMaterial.set(key, (requisitionByRecipientChildMaterial.get(key) ?? 0) + toNumber(item.confirmedQuantity ?? item.reportedQuantity));
        }
    }
    for (const change of changes) {
        const childMaterialKey = `${change.unitId}:${change.materialId}`;
        if (handledChildMaterial.has(childMaterialKey))
            continue;
        handledChildMaterial.add(childMaterialKey);
        const childIds = childIdsByParent.get(change.unitId) ?? [];
        const childLevel = unitLevelById.get(change.unitId);
        if (childIds.length === 0 || childLevel === undefined)
            continue;
        for (const recipientUnitId of childIds) {
            const reportKey = `${change.unitId}:${recipientUnitId}`;
            if (!reportsByKey.has(reportKey)) {
                reportsByKey.set(reportKey, {
                    header: buildHeader(change.unitId, recipientUnitId, username, creationTime, screenDate),
                    items: []
                });
            }
            reportsByKey.get(reportKey)?.items.push({
                materialId: change.materialId,
                reportedQuantity: requisitionByRecipientChildMaterial.get(`${change.unitId}:${recipientUnitId}:${change.materialId}`) ?? 0,
                reportingLevel: childLevel,
                reportingUnitId: change.unitId,
                ...buildBaseItem(username, creationTime, modifiedAt),
            });
        }
    }
    return Array.from(reportsByKey.values());
};
exports.buildNextLevelAllocationDraftChanges = buildNextLevelAllocationDraftChanges;
const buildAllocationBalanceUpdates = ({ allocationChanges, incomingAllocationReports, username, creationTime, }) => {
    const allocatedByMaterial = new Map();
    const reportsToSave = [];
    const modifiedAt = (0, date_1.combineDateAndTime)(new Date(), creationTime);
    for (const change of allocationChanges) {
        allocatedByMaterial.set(change.materialId, (allocatedByMaterial.get(change.materialId) ?? 0) + toNumber(change.quantity));
    }
    for (const report of incomingAllocationReports) {
        const itemsToUpdate = [];
        for (const item of report.items ?? []) {
            if (!item.materialId)
                continue;
            const remainingAllocation = allocatedByMaterial.get(item.materialId) ?? 0;
            if (remainingAllocation <= 0)
                continue;
            const currentBalance = toNumber(item.balanceQuantity ?? item.confirmedQuantity ?? item.reportedQuantity);
            const deduction = Math.min(currentBalance, remainingAllocation);
            allocatedByMaterial.set(item.materialId, remainingAllocation - deduction);
            itemsToUpdate.push({
                materialId: item.materialId,
                reportedQuantity: toNumber(item.reportedQuantity),
                confirmedQuantity: toNumber(item.confirmedQuantity),
                balanceQuantity: currentBalance - deduction,
                reportingLevel: item.reportingLevel,
                reportingUnitId: item.reportingUnitId,
                status: item.status ?? constants_1.RECORD_STATUS.ACTIVE,
                changedBy: username,
                changedAt: creationTime,
                modifiedAt,
            });
        }
        if (itemsToUpdate.length === 0)
            continue;
        reportsToSave.push({
            header: {
                reportTypeId: report.reportTypeId,
                unitId: report.unitId,
                recipientUnitId: report.recipientUnitId,
                reporterUnitId: report.reporterUnitId,
                createdOn: report.createdOn,
                createdBy: report.createdBy,
                createdAt: report.createdAt,
            },
            items: itemsToUpdate,
        });
    }
    return reportsToSave;
};
exports.buildAllocationBalanceUpdates = buildAllocationBalanceUpdates;
//# sourceMappingURL=report-allocation-save.utils.js.map