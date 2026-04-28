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
export declare const buildReportsToSave: ({ changes, reportingLevel, reportingUnitId, recipientUnitId, createdOn, createdAt, createdBy, parentByChild }: BuildReportsParams) => IReportsChanges[];
export {};
