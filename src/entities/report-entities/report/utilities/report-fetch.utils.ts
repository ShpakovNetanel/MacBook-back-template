import type { Material } from "src/entities/material-entities/material/material.model";
import type { Report } from "src/entities/report-entities/report/report.model";
import type { Unit } from "src/entities/unit-entities/unit/unit.model";
import type {
    FavoriteReportDto,
    MaterialDto,
    ReportDto,
    ReportItemDto,
    ReportItemTypeDto,
    UnitDto,
    UnitStatusDto,
} from "../report.types";
import { RECORD_STATUS, REPORT_TYPES } from "src/contants";
import { UnitRelation } from "src/entities/unit-entities/unit-relations/unit-relation.model";

type FetchReportsParams = {
    recipientUnitId: number;
    reports: Report[] | null | undefined;
};

type ReportItemAggregate = {
    materialId: string;
    unitId: number;
    unit: UnitDto;
    type: ReportItemTypeDto;
};

type MaterialCommentAggregate = {
    comment: string;
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

const buildMaterialDto = (materialId: string, material?: Material): MaterialDto => ({
    id: materialId,
    description: material?.description ?? "",
    multiply: toNumber(material?.multiply),
    nickname: material?.nickname?.nickname ?? "",
    category: material?.materialCategory?.mainCategory?.description ?? "",
    unitOfMeasure: material?.unitOfMeasurement ?? "",
});

export const buildReportsResponse = ({ recipientUnitId, reports }: FetchReportsParams): ReportDto[] => {
    if (!reports?.length) return [];

    const materialById = new Map<string, MaterialDto>();
    const itemByKey = new Map<string, ReportItemAggregate>();
    const unitCommentByMaterial = new Map<string, MaterialCommentAggregate>();

    for (const report of reports) {
        const unitDetail = report.unit?.details?.[0];
        const recipientDetail = report.recipientUnit?.details?.[0];
        const unitStatus = report.unit?.unitStatus?.[0]?.unitStatus;
        const recipientStatus = report.recipientUnit?.unitStatus?.[0]?.unitStatus;

        const recipientUnit = buildUnitDto(
            report.recipientUnitId ?? recipientUnitId,
            recipientDetail,
            null,
            recipientStatus
        );

        const reportingUnit = buildUnitDto(
            report.unitId,
            unitDetail,
            recipientUnit,
            unitStatus
        );

        const reportItems = report.items ?? [];
        for (const item of reportItems) {
            if (!item.materialId) continue;

            if (!materialById.has(item.materialId)) {
                materialById.set(item.materialId, buildMaterialDto(item.materialId, item.material));
            }

            const key = `${report.unitId}:${item.materialId}:${report.reportTypeId}:${report.recipientUnitId ?? 0}`;

            if (toNumber(item.confirmedQuantity) !== 0 || report.reportTypeId !== REPORT_TYPES.REQUEST) {
                itemByKey.set(key, {
                    materialId: item.materialId,
                    unitId: report.unitId,
                    unit: reportingUnit,
                    type: {
                        id: report.reportTypeId,
                        quantity: toNumber(item.confirmedQuantity),
                        comment: '',
                        status: item.status ?? null,
                    },
                });
            }
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
            unitGroup = { unit: aggregate.unit, types: [] };
            byUnit.set(aggregate.unitId, unitGroup);
        }

        unitGroup.types.push(aggregate.type);
    }

    const result: ReportDto[] = [];
    for (const [materialId, byUnit] of grouped) {
        const material = materialById.get(materialId) ?? buildMaterialDto(materialId);
        const items = Array.from(byUnit.values())
            .map((item) => ({
                ...item,
                types: item.types.sort((a, b) => a.id - b.id),
            }))
            .sort((a, b) => a.unit.id - b.unit.id);

        result.push({
            material,
            comment: unitCommentByMaterial.get(materialId)?.comment ?? "",
            allocatedQuantity: null,
            items,
        });
    }

    return result.sort((a, b) => a.material.id.localeCompare(b.material.id));
};

export const buildReportsMaterialsResponse = (params: FetchReportsParams): ReportDto[] =>
    buildReportsResponse(params);

const buildFavoriteItemTypes = (reportTypeIds: number[]): ReportItemTypeDto[] =>
    reportTypeIds.map((reportTypeId) => ({
        id: reportTypeId,
        quantity: 0,
        comment: "",
        status: RECORD_STATUS.ACTIVE,
    }));

const buildFavoriteItems = (
    childrenUnits: UnitRelation[],
    reportTypeIds: number[]
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
            types: buildFavoriteItemTypes(reportTypeIds),
        };
    });

export const buildFavoriteReportsResponse = (
    materials: Material[] | null | undefined,
    childrenUnits: UnitRelation[],
    reportTypeIds: number[]
): FavoriteReportDto[] => {
    if (!materials?.length) return [];

    return materials
        .map((material) => ({
            material: buildMaterialDto(material.id, material),
            items: buildFavoriteItems(childrenUnits, reportTypeIds),
        }))
        .sort((a, b) => a.material.id.localeCompare(b.material.id));
};
