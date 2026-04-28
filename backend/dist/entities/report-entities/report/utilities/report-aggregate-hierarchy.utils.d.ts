import { UnitRelation } from "../../../unit-entities/unit-relations/unit-relation.model";
import { Report } from "../report.model";
import { AggregateUnitDto, IReportsChanges, UnitDto, UnitStatusDto } from "../report.types";
export declare const DEFAULT_STATUS: UnitStatusDto;
export type CalcReportKey = `${string}::${string}::${number}`;
export type CalcReport = {
    [key: CalcReportKey]: {
        id: number;
        unitId: number;
        recipientUnitId: number;
        reportTypeId: number;
        reporterId: string;
        createdOn: string;
        createdBy: string;
        createdAt: string;
        items: {
            [materialId: string]: {
                materialId: string;
                reportingUnitId: number;
                reportingUnitLevel: number;
                confirmedQuantity: number;
                reportedQuantity: number;
                status: string;
                modifiedAt: string;
                changedAt: string;
                changedBy: string;
            };
        };
    };
};
export type HierarchyReportsIndex = {
    all: Report[];
    childrenByParentUnitId: Record<number, Record<number, Report[]>>;
    getUnitReports: (unitId: number) => Report[];
    getChildrenReports: (parentUnitId: number) => Record<number, Report[]>;
};
export type UnitSource = {
    activeDetail?: {
        dataValues?: {
            description?: string | null;
            unitLevelId?: number | null;
            tsavIrgunCodeId?: string | null;
        };
    };
    details?: Array<{
        dataValues?: {
            description?: string | null;
            unitLevelId?: number | null;
            tsavIrgunCodeId?: string | null;
        };
    }>;
    unitStatus?: Array<{
        unitStatus?: {
            dataValues?: {
                id: number;
                description: string;
            };
            id?: number;
            description?: string;
        };
    }>;
};
export declare const sortNumeric: (values: number[]) => number[];
export declare const collectHierarchyUnitIds: (screenUnitId: number, childrenByParent: Map<number, number[]>) => number[];
export declare const toParentDto: (unit: AggregateUnitDto) => UnitDto;
export declare const buildAggregateUnitFromSource: (unitId: number, unit: UnitSource | undefined, emergencyUnitLookup: Record<number, boolean>) => AggregateUnitDto;
export declare const upsertAggregateUnit: (unitsById: Map<number, AggregateUnitDto>, candidate: AggregateUnitDto) => void;
export declare const buildHierarchyIndexes: (relations: UnitRelation[], emergencyUnitLookup: Record<number, boolean>) => {
    childrenByParent: Map<number, number[]>;
    parentsByChild: Map<number, number[]>;
    unitsById: Map<number, AggregateUnitDto>;
};
export declare const assertLowerHierarchyStable: (screenLowerUnits: number[], dbLowerUnits: number[]) => void;
export declare const buildUnitResolver: (unitsById: Map<number, AggregateUnitDto>, emergencyUnitLookup: Record<number, boolean>) => (unitId: number, source?: UnitSource) => AggregateUnitDto;
export declare const buildUnitsMap: (connectedUnitIds: number[], screenUnitId: number, parentsByChild: Map<number, number[]>, resolveUnit: (unitId: number, source?: UnitSource) => AggregateUnitDto) => Record<number, AggregateUnitDto>;
export declare const buildChildrenByParentMap: (childrenByParent: Map<number, number[]>, connectedUnitSet: Set<number>, unitsMap: Record<number, AggregateUnitDto>, resolveUnit: (unitId: number, source?: UnitSource) => AggregateUnitDto) => Record<number, AggregateUnitDto[]>;
export declare const buildHierarchyReportsIndex: ({ dbReports, childrenByParentMap, }: {
    dbReports: Report[];
    childrenByParentMap: Record<number, AggregateUnitDto[]>;
}) => HierarchyReportsIndex;
export declare const getAggregatedReports: ({ date, unitsToLaunch, screenUnitId, unitsMap, childrenByParentMap, dbReports, username, isLaunching }: {
    date: string;
    unitsToLaunch: number[];
    screenUnitId: number;
    unitsMap: Record<number, AggregateUnitDto>;
    childrenByParentMap: Record<number, AggregateUnitDto[]>;
    dbReports: Report[];
    username: string;
    isLaunching: boolean;
}) => Promise<IReportsChanges[]>;
