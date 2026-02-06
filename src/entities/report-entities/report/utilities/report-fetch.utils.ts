import type { Comment } from "src/entities/report-entities/comment/comment.model";
import type { ReportItem } from "src/entities/report-entities/report-item/report-item.model";
import type { Report } from "src/entities/report-entities/report/report.model";
import type { Stock } from "src/entities/report-entities/stock/stock.model";
import type { Material } from "src/entities/material-entities/material/material.model";
import type { UnitFavoriteMaterial } from "src/entities/material-entities/unit-favorite-material/unit-favorite-material.model";
import type { UnitDetail } from "src/entities/unit-entities/unit-details/unit-details.model";
import type { UnitStatusTypes } from "src/entities/unit-entities/units-statuses/units-statuses.model";
import type {
    MaterialDto,
    ReportDto,
    ReportItemDto,
    ReportItemTypeDto,
    UnitDto,
    UnitStatusDto
} from "../report.types";

type FetchReportsParams = {
    recipientUnitId: number;
    childUnitIds: number[];
    parentByChild: Map<number, number>;
    unitDetails: UnitDetail[];
    unitStatuses: UnitStatusTypes[];
    reports: Report[];
    reportItems: ReportItem[];
    materials: Material[];
    favorites: UnitFavoriteMaterial[];
    comments: Comment[];
    stocks: Stock[];
};

type ReportKey = {
    unitId: number;
    reportTypeId: number;
    recipientUnitId: number;
    createdOn: Date | null;
};

type ReportItemKey = {
    unitId: number;
    materialId: string;
    createdOn: Date;
    type: ReportItemTypeDto;
};

export const buildReportsResponse = ({
    recipientUnitId,
    childUnitIds,
    parentByChild,
    unitDetails,
    unitStatuses,
    reports,
    reportItems,
    materials,
    favorites,
    comments,
    stocks
}: FetchReportsParams): ReportDto[] => {
    const uniqueChildUnitIds = Array.from(new Set(childUnitIds));
    if (uniqueChildUnitIds.length === 0) return [];

    const defaultStatus: UnitStatusDto = {
        id: 0,
        description: "בדיווח",
        visibility: "visible"
    };

    const detailByUnit = buildDetailByUnit(unitDetails);
    const statusByUnit = buildStatusByUnit(unitStatuses);

    const recipientUnit = buildRecipientUnit(recipientUnitId, detailByUnit, statusByUnit, defaultStatus);
    const unitById = buildUnitById(uniqueChildUnitIds, parentByChild, recipientUnit, detailByUnit, statusByUnit, defaultStatus);

    const favoriteIds = new Set(favorites.map(favorite => favorite.materialId));
    const materialById = buildMaterialById(materials, favoriteIds);
    const commentByKey = buildCommentByKey(comments);
    const allocatedByMaterial = buildAllocatedByMaterial(stocks);
    const reportById = buildReportById(reports);
    const itemByKey = buildItemByKey(reportItems, reportById, unitById, commentByKey);

    const reportsByMaterial = groupByMaterial(itemByKey, unitById);
    return buildReportResult(reportsByMaterial, materialById, favoriteIds, allocatedByMaterial);
};

const buildDetailByUnit = (unitDetails: UnitDetail[]) => {
    const detailByUnit = new Map<number, UnitDetail>();
    for (const detail of unitDetails) {
        if (!detailByUnit.has(detail.unitId)) {
            detailByUnit.set(detail.unitId, detail);
        }
    }
    return detailByUnit;
};

const buildStatusByUnit = (unitStatuses: UnitStatusTypes[]) => {
    const statusByUnit = new Map<number, { id: number; description: string }>();
    for (const status of unitStatuses) {
        if (!statusByUnit.has(status.unitId)) {
            const unitStatus = status.unitStatus;
            if (unitStatus) {
                statusByUnit.set(status.unitId, {
                    id: unitStatus.id,
                    description: unitStatus.description
                });
            }
        }
    }
    return statusByUnit;
};

const buildRecipientUnit = (
    recipientUnitId: number,
    detailByUnit: Map<number, UnitDetail>,
    statusByUnit: Map<number, { id: number; description: string }>,
    defaultStatus: UnitStatusDto
): UnitDto => {
    const recipientDetail = detailByUnit.get(recipientUnitId);
    const recipientStatus = statusByUnit.get(recipientUnitId);

    return {
        id: recipientUnitId,
        description: recipientDetail?.description ?? "",
        level: recipientDetail?.unitLevelId ?? 0,
        simul: recipientDetail?.tsavIrgunCodeId ?? "",
        parent: null,
        status: recipientStatus
            ? { ...recipientStatus, visibility: "visible" }
            : defaultStatus
    };
};

const buildUnitById = (
    childUnitIds: number[],
    parentByChild: Map<number, number>,
    recipientUnit: UnitDto,
    detailByUnit: Map<number, UnitDetail>,
    statusByUnit: Map<number, { id: number; description: string }>,
    defaultStatus: UnitStatusDto
) => {
    const unitBaseById = new Map<number, UnitDto>();
    unitBaseById.set(recipientUnit.id, recipientUnit);

    for (const unitId of childUnitIds) {
        const detail = detailByUnit.get(unitId);
        const status = statusByUnit.get(unitId);
        unitBaseById.set(unitId, {
            id: unitId,
            description: detail?.description ?? "",
            level: detail?.unitLevelId ?? 0,
            simul: detail?.tsavIrgunCodeId ?? "",
            parent: null,
            status: status ? { ...status, visibility: "visible" } : defaultStatus
        });
    }

    const unitById = new Map<number, UnitDto>();
    for (const unitId of childUnitIds) {
        const baseUnit = unitBaseById.get(unitId);
        if (!baseUnit) continue;

        const parentId = parentByChild.get(unitId) ?? recipientUnit.id;
        const parentBase = unitBaseById.get(parentId) ?? recipientUnit;
        const parent = { ...parentBase, parent: null };

        unitById.set(unitId, {
            ...baseUnit,
            parent
        });
    }

    return unitById;
};

const buildMaterialById = (materials: Material[], favoriteIds: Set<string>) => {
    const materialById = new Map<string, MaterialDto>();
    for (const material of materials) {
        const multiplyValue = Number(material.multiply ?? 0);
        const multiply = Number.isNaN(multiplyValue) ? 0 : multiplyValue;
        materialById.set(material.id, {
            id: material.id,
            description: material.description ?? "",
            multiply,
            nickname: material.nickname?.nickname ?? "",
            category: material.materialCategory?.mainCategory?.description ?? "",
            unitOfMeasure: material.unitOfMeasurement ?? "",
            favorite: favoriteIds.has(material.id)
        });
    }
    return materialById;
};

const buildCommentByKey = (comments: Comment[]) => {
    const commentByKey = new Map<string, string>();
    for (const comment of comments) {
        const key = `${comment.unitId}:${comment.materialId}:${comment.type}:${comment.recipientUnitId}`;
        if (!commentByKey.has(key)) {
            commentByKey.set(key, comment.text ?? "");
        }
    }
    return commentByKey;
};

const buildAllocatedByMaterial = (stocks: Stock[]) => {
    const allocatedByMaterial = new Map<string, number>();
    for (const stock of stocks) {
        if (!allocatedByMaterial.has(stock.materialId)) {
            const quantityValue = Number(stock.quantity ?? 0);
            allocatedByMaterial.set(
                stock.materialId,
                Number.isNaN(quantityValue) ? 0 : quantityValue
            );
        }
    }
    return allocatedByMaterial;
};

const buildReportById = (reports: Report[]) => {
    const reportById = new Map<number, ReportKey>();
    for (const report of reports) {
        reportById.set(report.id, {
            unitId: report.unitId,
            reportTypeId: report.reportTypeId,
            createdOn: report.createdOn ?? null,
            recipientUnitId: report.recipientUnitId
        });
    }
    return reportById;
};

const buildItemByKey = (
    reportItems: ReportItem[],
    reportById: Map<number, ReportKey>,
    unitById: Map<number, UnitDto>,
    commentByKey: Map<string, string>
) => {
    const itemByKey = new Map<string, ReportItemKey>();

    for (const item of reportItems) {
        const report = reportById.get(item.reportId);
        if (!report) continue;
        if (!unitById.has(report.unitId)) continue;

        const createdOn = report.createdOn ?? new Date(0);
        const key = `${report.unitId}:${item.materialId}:${report.reportTypeId}`;
        const existing = itemByKey.get(key);
        if (existing && existing.createdOn >= createdOn) continue;

        const quantityValue = Number(item.confirmedQuantity ?? item.reportedQuantity ?? 0);
        const quantity = Number.isNaN(quantityValue) ? 0 : quantityValue;
        const commentKey = `${report.unitId}:${item.materialId}:${report.reportTypeId}:${report.recipientUnitId}`;

        itemByKey.set(key, {
            unitId: report.unitId,
            materialId: item.materialId,
            createdOn,
            type: {
                id: report.reportTypeId,
                quantity,
                comment: commentByKey.get(commentKey) ?? "",
                status: item.status ?? null
            }
        });
    }

    return itemByKey;
};

const groupByMaterial = (itemByKey: Map<string, ReportItemKey>, unitById: Map<number, UnitDto>) => {
    const reportsByMaterial = new Map<string, { itemsByUnit: Map<number, ReportItemDto> }>();

    for (const aggregate of itemByKey.values()) {
        let materialGroup = reportsByMaterial.get(aggregate.materialId);
        if (!materialGroup) {
            materialGroup = { itemsByUnit: new Map() };
            reportsByMaterial.set(aggregate.materialId, materialGroup);
        }

        let itemGroup = materialGroup.itemsByUnit.get(aggregate.unitId);
        if (!itemGroup) {
            const unit = unitById.get(aggregate.unitId);
            if (!unit) continue;
            itemGroup = { unit, types: [] };
            materialGroup.itemsByUnit.set(aggregate.unitId, itemGroup);
        }

        itemGroup.types.push(aggregate.type);
    }

    return reportsByMaterial;
};

const buildReportResult = (
    reportsByMaterial: Map<string, { itemsByUnit: Map<number, ReportItemDto> }>,
    materialById: Map<string, MaterialDto>,
    favoriteIds: Set<string>,
    allocatedByMaterial: Map<string, number>
): ReportDto[] => {
    const result: ReportDto[] = [];

    for (const [materialId, materialGroup] of reportsByMaterial) {
        const material: MaterialDto = materialById.get(materialId) ?? {
            id: materialId,
            description: "",
            multiply: 0,
            nickname: "",
            category: "",
            unitOfMeasure: "",
            favorite: favoriteIds.has(materialId)
        };

        const items = Array.from(materialGroup.itemsByUnit.values())
            .map(item => ({
                ...item,
                types: item.types.sort((a, b) => a.id - b.id)
            }))
            .sort((a, b) => a.unit.id - b.unit.id);

        result.push({
            material,
            comment: "",
            allocatedQuantity: allocatedByMaterial.has(materialId)
                ? allocatedByMaterial.get(materialId) ?? null
                : null,
            items
        });
    }

    return result.sort((a, b) => a.material.id.localeCompare(b.material.id));
};
