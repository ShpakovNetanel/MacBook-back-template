import { BadGatewayException } from "@nestjs/common";
import { isDefined, isEmptyish } from "remeda";
import { MESSAGE_TYPES, RECORD_STATUS, REPORT_TYPES, UNIT_LEVELS, UNIT_STATUSES } from "src/contants";
import { UnitRelation } from "src/entities/unit-entities/unit-relations/unit-relation.model";
import { formatDate } from "src/utils/date";
import { IReport, Report } from "../report.model";
import { AggregatedMaterials, AggregateUnitDto, IReportsChanges, UnitDto, UnitStatusDto } from "../report.types";
import { hasHierarchyChanged } from "./report-common.utils";
import { IReportItem } from "../../report-item/report-item.model";

export const DEFAULT_STATUS: UnitStatusDto = {
    id: 0,
    description: "בדיווח",
};

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
    activeDetail?: { dataValues?: { description?: string | null; unitLevelId?: number | null; tsavIrgunCodeId?: string | null } };
    details?: Array<{ dataValues?: { description?: string | null; unitLevelId?: number | null; tsavIrgunCodeId?: string | null } }>;
    unitStatus?: Array<{ unitStatus?: { dataValues?: { id: number; description: string }; id?: number; description?: string } }>;
};

export const sortNumeric = (values: number[]): number[] =>
    Array.from(new Set(values)).sort((a, b) => a - b);

export const collectHierarchyUnitIds = (
    screenUnitId: number,
    childrenByParent: Map<number, number[]>
): number[] => {
    const visited = new Set<number>([screenUnitId]);
    const queue = [screenUnitId];

    while (queue.length > 0) {
        const current = queue.shift();
        if (current === undefined) continue;

        for (const childId of childrenByParent.get(current) ?? []) {
            if (visited.has(childId)) continue;
            visited.add(childId);
            queue.push(childId);
        }
    }

    return sortNumeric(Array.from(visited));
};

export const toParentDto = (unit: AggregateUnitDto): UnitDto => ({
    id: unit.id,
    description: unit.description,
    level: unit.level,
    simul: unit.simul,
    status: unit.status,
    parent: null,
});

export const buildAggregateUnitFromSource = (
    unitId: number,
    unit: UnitSource | undefined,
    emergencyUnitLookup: Record<number, boolean>
): AggregateUnitDto => {
    const detail = unit?.activeDetail?.dataValues ?? unit?.details?.[0]?.dataValues;
    const statusModel = unit?.unitStatus?.[0]?.unitStatus;
    const status = statusModel?.dataValues
        ?? (statusModel?.id ? { id: statusModel.id, description: statusModel.description ?? "" } : DEFAULT_STATUS);

    return {
        id: unitId,
        description: detail?.description ?? "",
        level: detail?.unitLevelId ?? 0,
        simul: detail?.tsavIrgunCodeId ?? "",
        status,
        isEmergencyUnit: !!emergencyUnitLookup[unitId],
        parent: null,
    };
};

export const upsertAggregateUnit = (
    unitsById: Map<number, AggregateUnitDto>,
    candidate: AggregateUnitDto
) => {
    const existing = unitsById.get(candidate.id);
    if (!existing) {
        unitsById.set(candidate.id, candidate);
        return;
    }

    const merged: AggregateUnitDto = {
        ...existing,
        description: existing.description || candidate.description,
        level: existing.level || candidate.level,
        simul: existing.simul || candidate.simul,
        status: existing.status.id ? existing.status : candidate.status,
        isEmergencyUnit: existing.isEmergencyUnit || candidate.isEmergencyUnit,
        parent: existing.parent ?? null,
    };

    unitsById.set(candidate.id, merged);
};

export const buildHierarchyIndexes = (
    relations: UnitRelation[],
    emergencyUnitLookup: Record<number, boolean>
) => {
    const childrenByParent = new Map<number, number[]>();
    const parentsByChild = new Map<number, number[]>();
    const unitsById = new Map<number, AggregateUnitDto>();

    for (const relation of relations) {
        const parentId = relation.unitId;
        const childId = relation.relatedUnitId;

        const children = childrenByParent.get(parentId) ?? [];
        children.push(childId);
        childrenByParent.set(parentId, children);

        const parents = parentsByChild.get(childId) ?? [];
        parents.push(parentId);
        parentsByChild.set(childId, parents);

        upsertAggregateUnit(
            unitsById,
            buildAggregateUnitFromSource(parentId, relation.unit, emergencyUnitLookup)
        );
        upsertAggregateUnit(
            unitsById,
            buildAggregateUnitFromSource(childId, relation.relatedUnit, emergencyUnitLookup)
        );
    }

    return { childrenByParent, parentsByChild, unitsById };
};

export const assertLowerHierarchyStable = (
    screenLowerUnits: number[],
    dbLowerUnits: number[]
) => {
    if (isDefined(screenLowerUnits) && !hasHierarchyChanged([...screenLowerUnits], [...dbLowerUnits], []).changed) return;

    throw new BadGatewayException({
        message: 'ההיררכיה תחתיך השתנתה, יש לרענן את המסך',
        type: MESSAGE_TYPES.FAILURE
    });
};

export const buildUnitResolver = (
    unitsById: Map<number, AggregateUnitDto>,
    emergencyUnitLookup: Record<number, boolean>
) => {
    return (unitId: number, source?: UnitSource): AggregateUnitDto => {
        const existing = unitsById.get(unitId);
        if (existing) return existing;

        const candidate = buildAggregateUnitFromSource(unitId, source, emergencyUnitLookup);
        upsertAggregateUnit(unitsById, candidate);
        return unitsById.get(unitId) ?? candidate;
    };
};

export const buildUnitsMap = (
    connectedUnitIds: number[],
    screenUnitId: number,
    parentsByChild: Map<number, number[]>,
    resolveUnit: (unitId: number, source?: UnitSource) => AggregateUnitDto
): Record<number, AggregateUnitDto> => {
    const unitsMap: Record<number, AggregateUnitDto> = {};
    const unitIdsToBuild = new Set<number>(connectedUnitIds);

    for (const parentId of parentsByChild.get(screenUnitId) ?? []) {
        unitIdsToBuild.add(parentId);
    }

    for (const unitId of sortNumeric(Array.from(unitIdsToBuild))) {
        const unit = resolveUnit(unitId);
        const parentId = sortNumeric(parentsByChild.get(unitId) ?? [])[0] ?? null;
        if (parentId !== null) {
            unit.parent = toParentDto(resolveUnit(parentId));
        }

        unitsMap[unitId] = unit;
    }

    return unitsMap;
};

export const buildChildrenByParentMap = (
    childrenByParent: Map<number, number[]>,
    connectedUnitSet: Set<number>,
    unitsMap: Record<number, AggregateUnitDto>,
    resolveUnit: (unitId: number, source?: UnitSource) => AggregateUnitDto
): Record<number, AggregateUnitDto[]> => {
    const childrenByParentMap: Record<number, AggregateUnitDto[]> = {};

    for (const [parentId, children] of childrenByParent) {
        if (!connectedUnitSet.has(parentId)) continue;

        const filteredChildren = sortNumeric(
            children.filter((childId) => {
                if (!connectedUnitSet.has(childId)) return false;

                const childUnit = unitsMap[childId] ?? resolveUnit(childId);
                return childUnit.parent?.id === parentId;
            })
        );

        if (filteredChildren.length === 0) continue;
        childrenByParentMap[parentId] = filteredChildren.map((childId) => unitsMap[childId] ?? resolveUnit(childId));
    }

    return childrenByParentMap;
};

const pushNumberKeyed = <T>(record: Record<number, T[]>, key: number, value: T) => {
    if (!record[key]) {
        record[key] = [];
    }

    record[key].push(value);
};

export const buildHierarchyReportsIndex = ({
    dbReports,
    childrenByParentMap,
}: {
    dbReports: Report[];
    childrenByParentMap: Record<number, AggregateUnitDto[]>;
}): HierarchyReportsIndex => {
    const byUnitId: Record<number, Report[]> = {};
    const childrenByParentUnitId: Record<number, Record<number, Report[]>> = {};

    for (const [parentIdAsString, children] of Object.entries(childrenByParentMap)) {
        const parentId = Number(parentIdAsString);
        const childReports: Record<number, Report[]> = {};

        for (const child of children) {
            childReports[child.id] = [];
        }

        childrenByParentUnitId[parentId] = childReports;
    }

    for (const report of dbReports) {
        pushNumberKeyed(byUnitId, report.unitId, report);

        if (report.recipientUnitId === null) continue;

        const parentChildrenReports = childrenByParentUnitId[report.recipientUnitId];
        if (!parentChildrenReports) continue;
        if (!parentChildrenReports[report.unitId]) continue;

        parentChildrenReports[report.unitId].push(report);
    }

    return {
        all: dbReports,
        childrenByParentUnitId,
        getUnitReports: (unitId: number) => byUnitId[unitId] ?? [],
        getChildrenReports: (parentUnitId: number) => childrenByParentUnitId[parentUnitId] ?? {},
    };
};

const upsertReports = (
    reports: CalcReport,
    reportType: number,
    unitId: number,
    parentUnit: AggregateUnitDto,
    unitReport: Report | undefined,
    screenUnitId: number,
    status: string,
    date: string,
    aggregatedMaterials: AggregatedMaterials[],
    username: string
) => {
    const reportKey = `${unitId}::${parentUnit.id}::${reportType}`;
    const { formattedTime } = formatDate(new Date());

    if (!reports[reportKey]) {
        reports[reportKey] = {
            unitId,
            recipientUnitId: parentUnit.id,
            reportTypeId: reportType,
            reporterId: unitReport?.dataValues?.reporterUnitId ?? screenUnitId,
            createdBy: unitReport?.dataValues?.createdBy ?? username,
            createdOn: unitReport?.dataValues?.createdOn ?? date,
            createdAt: unitReport?.dataValues?.createdAt ?? formattedTime,
            items: {},
        };
    }

    for (const material of aggregatedMaterials) {
        const existing = reports[reportKey]?.items[material.materialId];

        if (existing) {
            existing.reportedQuantity += Number(material.quantity);
            existing.confirmedQuantity += Number(material.quantity);
            existing.status = status;
        } else {
            reports[reportKey].items[material.materialId] = {
                materialId: material.materialId,
                reportingUnitId: parentUnit?.id,
                reportingLevel: parentUnit?.level,
                reportedQuantity: Number(material.quantity),
                confirmedQuantity: Number(material.quantity),
                status,
                modifiedAt: new Date(),
                changedAt: formattedTime,
                changedBy: username,
            };
        }
    }

    for (const reportItem of unitReport?.items ?? []) {
        if (!aggregatedMaterials.some(mat => mat.materialId === reportItem.materialId)) {
            reports[reportKey].items[reportItem.materialId] = {
                materialId: reportItem.materialId,
                reportingUnitId: parentUnit?.id,
                reportingLevel: parentUnit?.level,
                reportedQuantity: Number(reportItem.confirmedQuantity),
                confirmedQuantity: Number(reportItem.confirmedQuantity),
                status: RECORD_STATUS.INACTIVE,
                modifiedAt: new Date(),
                changedAt: formattedTime,
                changedBy: username,
            };
        }
    }
}

const sumMaterialQuantities = (aggregatedMaterials: AggregatedMaterials[], item: IReportItem) => {
    const existing = aggregatedMaterials.find(mat => mat.materialId === item.materialId);

    if (existing) {
        existing.quantity += Number(item.confirmedQuantity);
    } else {
        aggregatedMaterials.push({
            materialId: item.materialId,
            quantity: Number(item.confirmedQuantity),
        });
    }
}

const calculateReports = async (
    currentUnit: AggregateUnitDto,
    reportType: number,
    date: string,
    screenUnitId: number,
    unitsMap: Record<number, AggregateUnitDto>,
    childrenByParentMap: Record<number, AggregateUnitDto[]>,
    reports: CalcReport,
    hierarchyReportsIndex: HierarchyReportsIndex,
    username: string
) => {
    let aggregatedMaterials: AggregatedMaterials[] = [];

    try {
        const unitReport = hierarchyReportsIndex.getUnitReports(currentUnit.id).find(report => report.reportTypeId === reportType);
        const childrenReports = Object
            .values(hierarchyReportsIndex.getChildrenReports(currentUnit.id))
            .flat()
            .filter(report => report.reportTypeId === reportType);

        const parentUnit = unitsMap[currentUnit.parent?.id ?? -1];
        const childrenUnits = childrenByParentMap[currentUnit.id] ?? [];

        if (currentUnit.level !== UNIT_LEVELS.GDUD &&
            reportType !== REPORT_TYPES.REQUEST &&
            ((unitReport && childrenUnits.every(child => !child.isEmergencyUnit))
                || (isEmptyish(childrenReports) && isDefined(unitReport)))
        ) {
            const emptyItems = unitReport?.items?.map(item => ({
                materialId: item.materialId,
                quantity: 0
            })) ?? [];

            upsertReports(
                reports,
                reportType,
                currentUnit.id,
                parentUnit,
                unitReport,
                screenUnitId,
                RECORD_STATUS.INACTIVE,
                date,
                emptyItems,
                username
            )
        }

        if ((currentUnit.status.id === UNIT_STATUSES.WAITING_FOR_ALLOCATION ||
            currentUnit.level === UNIT_LEVELS.GDUD) && unitReport
        ) {
            for (const item of unitReport.items ?? []) {
                sumMaterialQuantities(aggregatedMaterials, item.dataValues);
            }

            upsertReports(
                reports,
                reportType,
                currentUnit.id,
                parentUnit,
                unitReport,
                screenUnitId,
                RECORD_STATUS.ACTIVE,
                date,
                aggregatedMaterials,
                username
            );

            return aggregatedMaterials;
        }

        for (const unitChild of childrenUnits) {
            const childAggregation = await calculateReports(
                unitChild,
                reportType,
                date,
                screenUnitId,
                unitsMap,
                childrenByParentMap,
                reports,
                hierarchyReportsIndex,
                username
            );

            if (childAggregation.length) {
                for (const item of childAggregation) {
                    sumMaterialQuantities(aggregatedMaterials, {
                        materialId: item.materialId,
                        confirmedQuantity: item.quantity
                    } as IReportItem);
                }
            }
        }

        upsertReports(
            reports,
            reportType,
            currentUnit.id,
            parentUnit,
            unitReport,
            screenUnitId,
            RECORD_STATUS.ACTIVE,
            date,
            aggregatedMaterials,
            username
        );

        return aggregatedMaterials;
    } catch (error) {
        console.log(error);

        throw new BadGatewayException({
            message: 'העלאת הדיווחים נכשלה, יש לנסות שוב',
            type: MESSAGE_TYPES.FAILURE
        });

    }
}

const formatReportsToDB = (reports: CalcReport) => {
    const reportsToDB: IReportsChanges[] = [];

    for (const key of Object.keys(reports)) {
        const header = reports[key];

        reportsToDB.push({
            header,
            items: Object.values(header.items)
        });
    }

    return reportsToDB;
}


export const getAggregatedReports = async ({
    date,
    unitsToLaunch,
    screenUnitId,
    unitsMap,
    childrenByParentMap,
    dbReports,
    username
}: {
    date: string,
    unitsToLaunch: number[],
    screenUnitId: number,
    unitsMap: Record<number, AggregateUnitDto>,
    childrenByParentMap: Record<number, AggregateUnitDto[]>,
    dbReports: Report[],
    username: string
}) => {
    const reports: CalcReport = {};
    const hierarchyReportsIndex = buildHierarchyReportsIndex({
        dbReports,
        childrenByParentMap,
    });

    try {
        for (const unit of unitsToLaunch) {
            const currentUnit = unitsMap[unit];

            for (const reportType of [REPORT_TYPES.USAGE, REPORT_TYPES.INVENTORY, REPORT_TYPES.REQUEST]) {
                await calculateReports(
                    currentUnit,
                    reportType,
                    date,
                    screenUnitId,
                    unitsMap,
                    childrenByParentMap,
                    reports,
                    hierarchyReportsIndex,
                    username
                );
            }
        }
        return formatReportsToDB(reports);
    } catch (error) {
        throw error;
    }
}
