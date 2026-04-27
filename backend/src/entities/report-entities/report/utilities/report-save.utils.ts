import { combineDateAndTime } from "../../../../utils/date";
import type { IReportsChanges, SaveCommitteesBody } from "../report.types";

type BuildReportsParams = {
    changes: SaveCommitteesBody["changes"];
    reportingLevel: number;
    reportingUnitId: number;
    recipientUnitId: number;
    createdOn: string | Date;
    createdAt: string;
    createdBy: string;
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
    parentByChild
}: BuildReportsParams): IReportsChanges[] => {
    const reportsByKey = new Map<string, IReportsChanges>();
    const changedBy = createdBy || null;
    const createdOnDate = new Date(createdOn);

    const modifiedAt = combineDateAndTime(new Date(), createdAt);

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
