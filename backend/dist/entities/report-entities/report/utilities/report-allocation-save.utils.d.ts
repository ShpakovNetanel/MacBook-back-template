import { Report } from "../report.model";
import { IUnit } from "../../../unit-entities/unit/unit.model";
import { IReportsChanges, SaveAllocationsDTO } from "../report.types";
type AllocationChange = SaveAllocationsDTO["changes"][number] & {
    existingConfirmedQuantity?: number;
    existingBalanceQuantity?: number;
};
type BaseAllocationParams = {
    username: string;
    creationTime: string;
    screenDate: Date;
};
type BuildConfirmedAllocationsParams = BaseAllocationParams & {
    changes: AllocationChange[];
    screenUnit: Pick<IUnit, "unitId" | "unitLevelId">;
};
type BuildDraftAllocationsParams = BaseAllocationParams & {
    childIdsByParent: Map<number, number[]>;
    changes: AllocationChange[];
    unitLevelById: Map<number, number>;
    requisitionReports: Report[];
};
type BuildBalanceUpdatesParams = {
    username: string;
    creationTime: string;
    allocationChanges: AllocationChange[];
    incomingAllocationReports: Report[];
};
export declare const mergeMatkalRequisitionAllocations: (changes: AllocationChange[], requisitionReports: Report[]) => AllocationChange[];
export declare const buildAllocationChangesFromRequisitionReports: (requisitionReports: Report[]) => AllocationChange[];
export declare const buildAllocationChangesFromReports: (reports: Report[], isDvhExcel: boolean) => AllocationChange[];
export declare const buildDownloadAllocationChanges: ({ isMatkal, outgoingAllocationReports, requisitionReports, isDvhExcel }: {
    isMatkal: boolean;
    outgoingAllocationReports: Report[];
    requisitionReports: Report[];
    isDvhExcel: boolean;
}) => AllocationChange[];
export declare const buildAllocationsChanges: ({ changes, username, creationTime, screenUnit, screenDate }: BuildConfirmedAllocationsParams) => IReportsChanges[];
export declare const buildConfirmedAllocationChanges: ({ changes, username, creationTime, screenUnit, screenDate }: BuildConfirmedAllocationsParams) => IReportsChanges[];
export declare const buildNextLevelAllocationDraftChanges: ({ childIdsByParent, changes, username, creationTime, screenDate, unitLevelById, requisitionReports, }: BuildDraftAllocationsParams) => IReportsChanges[];
export declare const buildAllocationBalanceUpdates: ({ allocationChanges, incomingAllocationReports, username, creationTime, }: BuildBalanceUpdatesParams) => IReportsChanges[];
export {};
