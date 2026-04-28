"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReportsToSave = void 0;
const date_1 = require("../../../../utils/date");
const buildReportsToSave = ({ changes, reportingLevel, reportingUnitId, recipientUnitId, createdOn, createdAt, createdBy, parentByChild }) => {
    const reportsByKey = new Map();
    const changedBy = createdBy || null;
    const createdOnDate = new Date(createdOn);
    const modifiedAt = (0, date_1.combineDateAndTime)(new Date(), createdAt);
    for (const change of changes) {
        const parentUnitId = parentByChild.get(change.unitId) ?? recipientUnitId;
        const key = `${change.unitId}:${change.type}:${parentUnitId}`;
        const existing = reportsByKey.get(key);
        if (!existing) {
            reportsByKey.set(key, {
                header: {
                    reportTypeId: change.type,
                    unitId: change.unitId,
                    recipientUnitId: parentUnitId,
                    reporterUnitId: reportingUnitId,
                    createdOn: createdOnDate,
                    createdAt,
                    createdBy
                },
                items: []
            });
        }
        reportsByKey.get(key)?.items.push({
            reportId: 0,
            materialId: change.materialId,
            reportingLevel,
            reportingUnitId,
            confirmedQuantity: change.quantity,
            status: change.status,
            changedAt: createdAt,
            changedBy,
            modifiedAt: new Date(modifiedAt)
        });
    }
    return Array.from(reportsByKey.values());
};
exports.buildReportsToSave = buildReportsToSave;
//# sourceMappingURL=report-save.utils.js.map