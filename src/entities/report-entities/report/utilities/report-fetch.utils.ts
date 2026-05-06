import type { Material } from "../../../material-entities/material/material.model";
import type { StandardGroup } from "../../../standard-entities/standard-group/standard-group.model";
import type { Report } from "../report.model";
import type { Unit } from "../../../unit-entities/unit/unit.model";
import type {
    FavoriteReportDto,
    MaterialDto,
    ReportCommentDto,
    ReportDto,
    ReportItemDto,
    ReportItemTypeDto,
    UnitDto,
    UnitStatusDto,
} from "../report.types";
import { MATERIAL_TYPES, RECORD_STATUS, REPORT_TYPES } from "../../../../constants";
import { UnitRelation } from "../../../unit-entities/unit-relations/unit-relation.model";
import { isDefined } from "remeda";

type FetchReportsParams = {
    screenUnitId: number;
    reports: Report[] | null | undefined;
    yesterdayInventoryReports?: Report[] | null | undefined;
    screenAllocationReports?: Report[] | null | undefined;
    fetchQuantity?: boolean;
};

type ReportItemAggregate = {
    materialId: string;
    unitId: number;
    unit: UnitDto;
    allocatedQuantity: number | null;
    type: ReportItemTypeDto;
};

const DEFAULT_STATUS: UnitStatusDto = {
    id: 0,
    description: "בדיווח",
};

const toNumber = (value: string | number | null | undefined) => {
    const parsed = Number(value ?? 0);
    return Number.isNaN(parsed) ? 0 : parsed;
};

const buildUnitDto = (
    unitId: number,
    detail: Unit | undefined,
    parent: UnitDto | null,
    status: { id: number; description: string } | undefined
): UnitDto => ({
    id: unitId,
    description: detail?.description ?? "",
    level: detail?.unitLevelId ?? 0,
    simul: detail?.tsavIrgunCodeId ?? "",
    parent,
    status: status?.id
        ? { id: status.id, description: status.description }
        : DEFAULT_STATUS,
});

const toParentUnitDto = (parent: UnitDto | null): UnitDto | null =>
    parent
        ? {
            ...parent,
            parent: null,
        }
        : null;

const getStandardGroupCategory = (standardGroup?: StandardGroup) =>
    standardGroup?.categoryGroup?.categoryDesc?.description
    ?? standardGroup?.groupType
    ?? "";

const buildMaterialDto = (
    materialId: string,
    material?: Material,
    standardGroup?: StandardGroup
): MaterialDto => ({
    id: materialId,
    description: material?.description ?? standardGroup?.name ?? "",
    multiply: toNumber(material?.multiply),
    nickname: material?.nickname?.nickname ?? standardGroup?.nickname?.nickname ?? "",
    category: material?.materialCategory?.mainCategory?.description ?? getStandardGroupCategory(standardGroup),
    unitOfMeasure: material?.unitOfMeasurement ?? "יח",
    type: isDefined(material)
        ? MATERIAL_TYPES.ITEM
        : isDefined(standardGroup)
            ? standardGroup.groupType
            : MATERIAL_TYPES.ITEM,
});

const resolveCommentByAuthor = (
    comments: Material["comments"] | undefined,
    authorUnitId: number,
    scopedRecipientUnitId: number | null | undefined
) =>
    comments?.find((comment) =>
        comment.dataValues.unitId === authorUnitId &&
        comment.dataValues.recipientUnitId === scopedRecipientUnitId &&
        Boolean(comment.dataValues.text)
    )?.dataValues.text
    ?? comments?.find((comment) =>
        comment.dataValues.unitId === authorUnitId &&
        Boolean(comment.dataValues.text)
    )?.dataValues.text
    ?? "";

const buildYesterdayInventoryQuantityByUnitMaterial = (
    yesterdayInventoryReports: Report[] | null | undefined
) => {
    const yesterdayInventoryQuantityByUnitMaterial = new Map<string, number>();

    for (const report of yesterdayInventoryReports ?? []) {
        for (const item of report.items ?? []) {
            if (!item.materialId) continue;

            const quantity = toNumber(item.confirmedQuantity ?? item.reportedQuantity);
            const key = `${report.unitId}:${item.materialId}`;
            yesterdayInventoryQuantityByUnitMaterial.set(
                key,
                (yesterdayInventoryQuantityByUnitMaterial.get(key) ?? 0) + quantity
            );
        }
    }

    return yesterdayInventoryQuantityByUnitMaterial;
};

export const buildReportsResponse = ({
    screenUnitId,
    reports,
    yesterdayInventoryReports,
    screenAllocationReports,
    fetchQuantity = true
}: FetchReportsParams): ReportDto[] => {
    if (!reports?.length && !yesterdayInventoryReports?.length && !screenAllocationReports?.length) return [];

    const materialById = new Map<string, MaterialDto>();
    const itemByKey = new Map<string, ReportItemAggregate>();
    const reportCommentsByMaterial = new Map<string, Map<number, string>>();
    const yesterdayInventoryQuantityByUnitMaterial = buildYesterdayInventoryQuantityByUnitMaterial(yesterdayInventoryReports);
    const allocatedQuantityByMaterial = new Map<string, number>();
    const quantityLeftToAllocateByMaterial = new Map<string, number>();

    for (const report of screenAllocationReports ?? []) {
        for (const item of report.items ?? []) {
            if (!item.materialId) continue;

            if (!materialById.has(item.materialId)) {
                materialById.set(item.materialId, buildMaterialDto(item.materialId, item.material, item.standardGroup));
            }

            allocatedQuantityByMaterial.set(
                item.materialId,
                (allocatedQuantityByMaterial.get(item.materialId) ?? 0)
                + toNumber(item.confirmedQuantity)
            );

            quantityLeftToAllocateByMaterial.set(
                item.materialId,
                (quantityLeftToAllocateByMaterial.get(item.materialId) ?? 0)
                + toNumber(item.balanceQuantity)
            );
        }
    }

    for (const report of reports ?? []) {
        const isAllocationReport = report.reportTypeId === REPORT_TYPES.ALLOCATION;
        const isScreenUnitReport = !isAllocationReport && report.unitId === screenUnitId;
        const unitDetail = report.unit?.details?.[0];
        const recipientDetail = report.recipientUnit?.details?.[0];
        const unitStatus = report.unit?.unitStatus?.[0]?.unitStatus;
        const recipientStatus = report.recipientUnit?.unitStatus?.[0]?.unitStatus;

        const recipientUnit = buildUnitDto(
            report.recipientUnitId ?? screenUnitId,
            recipientDetail,
            null,
            recipientStatus
        );

        const reportingUnit = buildUnitDto(
            report.unitId,
            unitDetail,
            toParentUnitDto(recipientUnit),
            unitStatus
        );

        const allocationRecipientUnit = buildUnitDto(
            report.recipientUnitId ?? screenUnitId,
            recipientDetail,
            toParentUnitDto(reportingUnit),
            recipientStatus
        );

        const reportItems = report.items ?? [];
        for (const item of reportItems) {
            if (!item.materialId) continue;

            if (!materialById.has(item.materialId)) {
                materialById.set(item.materialId, buildMaterialDto(item.materialId, item.material, item.standardGroup));
            }

            const screenUnitComment = item.material?.comments?.find(comment => comment.unitId === screenUnitId)?.text ?? '';

            if (screenUnitComment) {
                let commentsByType = reportCommentsByMaterial.get(item.materialId);
                if (!commentsByType) {
                    commentsByType = new Map<number, string>();
                    reportCommentsByMaterial.set(item.materialId, commentsByType);
                }

                if (!commentsByType.has(report.reportTypeId)) {
                    commentsByType.set(report.reportTypeId, screenUnitComment);
                }
            }

            const childUnitComment = report.recipientUnitId === screenUnitId
                ? resolveCommentByAuthor(
                    item.material?.comments,
                    report.unitId,
                    report.recipientUnitId
                ) : "";

            const key = `${isAllocationReport ? report.recipientUnitId ?? screenUnitId : report.unitId}:${item.materialId}:${report.reportTypeId}:${report.recipientUnitId ?? 0}`;

            if (isAllocationReport || (!isScreenUnitReport && (toNumber(item.confirmedQuantity) !== 0 || report.reportTypeId !== REPORT_TYPES.REQUEST))) {
                itemByKey.set(key, {
                    materialId: item.materialId,
                    unitId: isAllocationReport ? report.recipientUnitId ?? screenUnitId : report.unitId,
                    unit: isAllocationReport ? allocationRecipientUnit : reportingUnit,
                    allocatedQuantity: isAllocationReport ? toNumber(item.confirmedQuantity) : null,
                    type: {
                        id: report.reportTypeId,
                        quantity: isAllocationReport
                            ? toNumber(item.reportedQuantity)
                            : fetchQuantity ? toNumber(item.confirmedQuantity) : 0,
                        availableQuantityToEat: isAllocationReport
                            ? toNumber(item.balanceQuantity)
                            : 0,
                        yesterdayInventoryQuantity: report.reportTypeId === REPORT_TYPES.INVENTORY
                            ? (yesterdayInventoryQuantityByUnitMaterial.get(`${report.unitId}:${item.materialId}`) ?? 0)
                            : null,
                        comment: childUnitComment,
                        status: item.status ?? null,
                    },
                });
            }
        }
    }

    for (const report of yesterdayInventoryReports ?? []) {
        if (report.unitId === screenUnitId) continue;

        const unitDetail = report.unit?.details?.[0];
        const recipientDetail = report.recipientUnit?.details?.[0];
        const unitStatus = report.unit?.unitStatus?.[0]?.unitStatus;
        const recipientStatus = report.recipientUnit?.unitStatus?.[0]?.unitStatus;

        const recipientUnit = buildUnitDto(
            report.recipientUnitId ?? screenUnitId,
            recipientDetail,
            null,
            recipientStatus
        );

        const reportingUnit = buildUnitDto(
            report.unitId,
            unitDetail,
            toParentUnitDto(recipientUnit),
            unitStatus
        );

        for (const item of report.items ?? []) {
            if (!item.materialId) continue;

            if (!materialById.has(item.materialId)) {
                materialById.set(item.materialId, buildMaterialDto(item.materialId, item.material, item.standardGroup));
            }

            const key = `${report.unitId}:${item.materialId}:${REPORT_TYPES.INVENTORY}:${report.recipientUnitId ?? 0}`;
            if (itemByKey.has(key)) continue;

            itemByKey.set(key, {
                materialId: item.materialId,
                unitId: report.unitId,
                unit: reportingUnit,
                allocatedQuantity: null,
                type: {
                    id: REPORT_TYPES.INVENTORY,
                    quantity: 0,
                    availableQuantityToEat: 0,
                    yesterdayInventoryQuantity: toNumber(item.confirmedQuantity ?? item.reportedQuantity),
                    comment: "",
                    status: item.status ?? null,
                },
            });
        }
    }

    const grouped = new Map<string, Map<number, ReportItemDto>>();
    for (const aggregate of itemByKey.values()) {
        let byUnit = grouped.get(aggregate.materialId);
        if (!byUnit) {
            byUnit = new Map<number, ReportItemDto>();
            grouped.set(aggregate.materialId, byUnit);
        }

        let unitGroup = byUnit.get(aggregate.unitId);
        if (!unitGroup) {
            unitGroup = { unit: aggregate.unit, allocatedQuantity: null, types: [] };
            byUnit.set(aggregate.unitId, unitGroup);
        }

        if (aggregate.allocatedQuantity !== null) {
            unitGroup.allocatedQuantity = (unitGroup.allocatedQuantity ?? 0) + aggregate.allocatedQuantity;
        }

        unitGroup.types.push(aggregate.type);
    }

    const materialIds = new Set<string>([
        ...grouped.keys(),
        ...reportCommentsByMaterial.keys(),
        ...allocatedQuantityByMaterial.keys(),
        ...quantityLeftToAllocateByMaterial.keys(),
    ]);

    const result: ReportDto[] = [];
    for (const materialId of materialIds) {
        const byUnit = grouped.get(materialId) ?? new Map<number, ReportItemDto>();
        const material = materialById.get(materialId) ?? buildMaterialDto(materialId);
        const comments = Array.from(reportCommentsByMaterial.get(materialId)?.entries() ?? [])
            .map(([type, comment]): ReportCommentDto => ({ type, comment }))
            .sort((a, b) => a.type - b.type);
        const items = Array.from(byUnit.values())
            .map((item) => ({
                ...item,
                types: item.types.sort((a, b) => a.id - b.id),
            }))
            .sort((a, b) => a.unit.id - b.unit.id);

        result.push({
            material,
            comments,
            receivedAllocationQuantity: allocatedQuantityByMaterial.get(materialId) ?? null,
            quantityLeftToAllocate: quantityLeftToAllocateByMaterial.get(materialId) ?? null,
            items,
        });
    }

    return result.sort((a, b) => a.material.id.localeCompare(b.material.id));
};

export const buildReportsMaterialsResponse = (params: FetchReportsParams): ReportDto[] =>
    buildReportsResponse(params);

const buildFavoriteItemTypes = (
    reportTypeIds: number[],
    unitId: number,
    materialId: string,
    yesterdayInventoryQuantityByUnitMaterial: Map<string, number>,
): ReportItemTypeDto[] =>
    reportTypeIds.map((reportTypeId) => ({
        id: reportTypeId,
        quantity: 0,
        availableQuantityToEat: 0,
        yesterdayInventoryQuantity: reportTypeId === REPORT_TYPES.INVENTORY
            ? (yesterdayInventoryQuantityByUnitMaterial.get(`${unitId}:${materialId}`) ?? 0)
            : null,
        comment: "",
        status: RECORD_STATUS.ACTIVE,
    }));

const buildFavoriteItems = (
    materialId: string,
    childrenUnits: UnitRelation[],
    reportTypeIds: number[],
    yesterdayInventoryQuantityByUnitMaterial: Map<string, number>,
): ReportItemDto[] =>
    childrenUnits.map((child) => {
        const parentUnit = buildUnitDto(
            child.unitId,
            child.unit?.activeDetail,
            null,
            undefined
        );

        return {
            unit: buildUnitDto(
                child.relatedUnitId,
                child.relatedUnit?.activeDetail,
                parentUnit,
                undefined
            ),
            allocatedQuantity: null,
            types: buildFavoriteItemTypes(
                reportTypeIds,
                child.relatedUnitId,
                materialId,
                yesterdayInventoryQuantityByUnitMaterial,
            ),
        };
    });

export const buildFavoriteReportsResponse = (
    materials: MaterialDto[] | null | undefined,
    childrenUnits: UnitRelation[],
    reportTypeIds: number[],
    yesterdayInventoryReports?: Report[] | null | undefined
): FavoriteReportDto[] => {
    if (!materials?.length) return [];

    const yesterdayInventoryQuantityByUnitMaterial = buildYesterdayInventoryQuantityByUnitMaterial(yesterdayInventoryReports);

    return materials
        .map((material) => ({
            material,
            items: buildFavoriteItems(
                material.id,
                childrenUnits,
                reportTypeIds.filter(reportTypeId =>
                    material.type === MATERIAL_TYPES.TOOL
                        ? reportTypeId === REPORT_TYPES.INVENTORY
                        : true
                ),
                yesterdayInventoryQuantityByUnitMaterial,
            ),
        }))
        .sort((a, b) => a.material.id.localeCompare(b.material.id));
};
