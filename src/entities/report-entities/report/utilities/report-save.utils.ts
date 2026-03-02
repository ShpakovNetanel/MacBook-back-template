import type { IReportsChanges, SaveReportsBody } from "../report.types";

type BuildReportsParams = {
    changes: SaveReportsBody["changes"];
    reportingLevel: number;
    reportingUnitId: number;
    recipientUnitId: number;
    createdOn: Date;
    createdAt: string;
    createdBy: string;
    recordStatus: string;
    parentByChild: Map<number, number>;
};

export const buildReportsToSave = ({
    changes,
    reportingLevel,
    reportingUnitId,
    recipientUnitId,
    createdOn,
    createdAt,
    createdBy,
    recordStatus,
    parentByChild
}: BuildReportsParams): IReportsChanges[] => {
    const reportsByKey = new Map<string, IReportsChanges>();
    const changedBy = createdBy || null;

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
                    createdOn,
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
            status: recordStatus,
            changedAt: createdAt,
            changedBy,
            modifiedAt: createdOn
        });
    }

    return Array.from(reportsByKey.values());
};
