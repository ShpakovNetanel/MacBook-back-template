"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFavoriteReportsResponse = exports.buildReportsMaterialsResponse = exports.buildReportsResponse = void 0;
const constants_1 = require("../../../../constants");
const remeda_1 = require("remeda");
const DEFAULT_STATUS = {
    id: 0,
    description: "בדיווח",
};
const toNumber = (value) => {
    const parsed = Number(value ?? 0);
    return Number.isNaN(parsed) ? 0 : parsed;
};
const buildUnitDto = (unitId, detail, parent, status) => ({
    id: unitId,
    description: detail?.description ?? "",
    level: detail?.unitLevelId ?? 0,
    simul: detail?.tsavIrgunCodeId ?? "",
    parent,
    status: status?.id
        ? { id: status.id, description: status.description }
        : DEFAULT_STATUS,
});
const toParentUnitDto = (parent) => parent
    ? {
        ...parent,
        parent: null,
    }
    : null;
const getStandardGroupCategory = (standardGroup) => standardGroup?.categoryGroup?.categoryDesc?.description
    ?? standardGroup?.groupType
    ?? "";
const buildMaterialDto = (materialId, material, standardGroup) => ({
    id: materialId,
    description: material?.description ?? standardGroup?.name ?? "",
    multiply: toNumber(material?.multiply),
    nickname: material?.nickname?.nickname ?? standardGroup?.nickname?.nickname ?? "",
    category: material?.materialCategory?.mainCategory?.description ?? getStandardGroupCategory(standardGroup),
    unitOfMeasure: material?.unitOfMeasurement ?? "יח",
    type: (0, remeda_1.isDefined)(material)
        ? constants_1.MATERIAL_TYPES.ITEM
        : (0, remeda_1.isDefined)(standardGroup)
            ? standardGroup.groupType
            : constants_1.MATERIAL_TYPES.ITEM,
});
const resolveCommentByAuthor = (comments, authorUnitId, scopedRecipientUnitId) => comments?.find((comment) => comment.dataValues.unitId === authorUnitId &&
    comment.dataValues.recipientUnitId === scopedRecipientUnitId &&
    Boolean(comment.dataValues.text))?.dataValues.text
    ?? comments?.find((comment) => comment.dataValues.unitId === authorUnitId &&
        Boolean(comment.dataValues.text))?.dataValues.text
    ?? "";
const buildYesterdayInventoryQuantityByUnitMaterial = (yesterdayInventoryReports) => {
    const yesterdayInventoryQuantityByUnitMaterial = new Map();
    for (const report of yesterdayInventoryReports ?? []) {
        for (const item of report.items ?? []) {
            if (!item.materialId)
                continue;
            const quantity = toNumber(item.confirmedQuantity ?? item.reportedQuantity);
            const key = `${report.unitId}:${item.materialId}`;
            yesterdayInventoryQuantityByUnitMaterial.set(key, (yesterdayInventoryQuantityByUnitMaterial.get(key) ?? 0) + quantity);
        }
    }
    return yesterdayInventoryQuantityByUnitMaterial;
};
const buildReportsResponse = ({ recipientUnitId, reports, yesterdayInventoryReports, screenAllocationReports, fetchQuantity = true }) => {
    if (!reports?.length && !yesterdayInventoryReports?.length && !screenAllocationReports?.length)
        return [];
    const materialById = new Map();
    const itemByKey = new Map();
    const reportCommentsByMaterial = new Map();
    const yesterdayInventoryQuantityByUnitMaterial = buildYesterdayInventoryQuantityByUnitMaterial(yesterdayInventoryReports);
    const allocatedQuantityByMaterial = new Map();
    const quantityLeftToAllocateByMaterial = new Map();
    for (const report of screenAllocationReports ?? []) {
        for (const item of report.items ?? []) {
            if (!item.materialId)
                continue;
            if (!materialById.has(item.materialId)) {
                materialById.set(item.materialId, buildMaterialDto(item.materialId, item.material, item.standardGroup));
            }
            allocatedQuantityByMaterial.set(item.materialId, (allocatedQuantityByMaterial.get(item.materialId) ?? 0)
                + toNumber(item.confirmedQuantity));
            quantityLeftToAllocateByMaterial.set(item.materialId, (quantityLeftToAllocateByMaterial.get(item.materialId) ?? 0)
                + toNumber(item.balanceQuantity));
        }
    }
    for (const report of reports ?? []) {
        const isAllocationReport = report.reportTypeId === constants_1.REPORT_TYPES.ALLOCATION;
        const isScreenUnitReport = !isAllocationReport && report.unitId === recipientUnitId;
        const unitDetail = report.unit?.details?.[0];
        const recipientDetail = report.recipientUnit?.details?.[0];
        const unitStatus = report.unit?.unitStatus?.[0]?.unitStatus;
        const recipientStatus = report.recipientUnit?.unitStatus?.[0]?.unitStatus;
        const recipientUnit = buildUnitDto(report.recipientUnitId ?? recipientUnitId, recipientDetail, null, recipientStatus);
        const reportingUnit = buildUnitDto(report.unitId, unitDetail, toParentUnitDto(recipientUnit), unitStatus);
        const allocationRecipientUnit = buildUnitDto(report.recipientUnitId ?? recipientUnitId, recipientDetail, toParentUnitDto(reportingUnit), recipientStatus);
        const reportItems = report.items ?? [];
        for (const item of reportItems) {
            if (!item.materialId)
                continue;
            if (!materialById.has(item.materialId)) {
                materialById.set(item.materialId, buildMaterialDto(item.materialId, item.material, item.standardGroup));
            }
            const screenUnitComment = item.material?.comments?.find(comment => comment.unitId === recipientUnitId)?.text ?? '';
            if (screenUnitComment) {
                let commentsByType = reportCommentsByMaterial.get(item.materialId);
                if (!commentsByType) {
                    commentsByType = new Map();
                    reportCommentsByMaterial.set(item.materialId, commentsByType);
                }
                if (!commentsByType.has(report.reportTypeId)) {
                    commentsByType.set(report.reportTypeId, screenUnitComment);
                }
            }
            const childUnitComment = resolveCommentByAuthor(item.material?.comments, report.unitId, report.recipientUnitId ?? recipientUnitId);
            const key = `${isAllocationReport ? report.recipientUnitId ?? recipientUnitId : report.unitId}:${item.materialId}:${report.reportTypeId}:${report.recipientUnitId ?? 0}`;
            if (isAllocationReport || (!isScreenUnitReport && (toNumber(item.confirmedQuantity) !== 0 || report.reportTypeId !== constants_1.REPORT_TYPES.REQUEST))) {
                itemByKey.set(key, {
                    materialId: item.materialId,
                    unitId: isAllocationReport ? report.recipientUnitId ?? recipientUnitId : report.unitId,
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
                        yesterdayInventoryQuantity: report.reportTypeId === constants_1.REPORT_TYPES.INVENTORY
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
        if (report.unitId === recipientUnitId)
            continue;
        const unitDetail = report.unit?.details?.[0];
        const recipientDetail = report.recipientUnit?.details?.[0];
        const unitStatus = report.unit?.unitStatus?.[0]?.unitStatus;
        const recipientStatus = report.recipientUnit?.unitStatus?.[0]?.unitStatus;
        const recipientUnit = buildUnitDto(report.recipientUnitId ?? recipientUnitId, recipientDetail, null, recipientStatus);
        const reportingUnit = buildUnitDto(report.unitId, unitDetail, toParentUnitDto(recipientUnit), unitStatus);
        for (const item of report.items ?? []) {
            if (!item.materialId)
                continue;
            if (!materialById.has(item.materialId)) {
                materialById.set(item.materialId, buildMaterialDto(item.materialId, item.material, item.standardGroup));
            }
            const key = `${report.unitId}:${item.materialId}:${constants_1.REPORT_TYPES.INVENTORY}:${report.recipientUnitId ?? 0}`;
            if (itemByKey.has(key))
                continue;
            itemByKey.set(key, {
                materialId: item.materialId,
                unitId: report.unitId,
                unit: reportingUnit,
                allocatedQuantity: null,
                type: {
                    id: constants_1.REPORT_TYPES.INVENTORY,
                    quantity: 0,
                    availableQuantityToEat: 0,
                    yesterdayInventoryQuantity: toNumber(item.confirmedQuantity ?? item.reportedQuantity),
                    comment: "",
                    status: item.status ?? null,
                },
            });
        }
    }
    const grouped = new Map();
    for (const aggregate of itemByKey.values()) {
        let byUnit = grouped.get(aggregate.materialId);
        if (!byUnit) {
            byUnit = new Map();
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
    const materialIds = new Set([
        ...grouped.keys(),
        ...reportCommentsByMaterial.keys(),
        ...allocatedQuantityByMaterial.keys(),
        ...quantityLeftToAllocateByMaterial.keys(),
    ]);
    const result = [];
    for (const materialId of materialIds) {
        const byUnit = grouped.get(materialId) ?? new Map();
        const material = materialById.get(materialId) ?? buildMaterialDto(materialId);
        const comments = Array.from(reportCommentsByMaterial.get(materialId)?.entries() ?? [])
            .map(([type, comment]) => ({ type, comment }))
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
exports.buildReportsResponse = buildReportsResponse;
const buildReportsMaterialsResponse = (params) => (0, exports.buildReportsResponse)(params);
exports.buildReportsMaterialsResponse = buildReportsMaterialsResponse;
const buildFavoriteItemTypes = (reportTypeIds, unitId, materialId, yesterdayInventoryQuantityByUnitMaterial) => reportTypeIds.map((reportTypeId) => ({
    id: reportTypeId,
    quantity: 0,
    availableQuantityToEat: 0,
    yesterdayInventoryQuantity: reportTypeId === constants_1.REPORT_TYPES.INVENTORY
        ? (yesterdayInventoryQuantityByUnitMaterial.get(`${unitId}:${materialId}`) ?? 0)
        : null,
    comment: "",
    status: constants_1.RECORD_STATUS.ACTIVE,
}));
const buildFavoriteItems = (materialId, childrenUnits, reportTypeIds, yesterdayInventoryQuantityByUnitMaterial) => childrenUnits.map((child) => {
    const parentUnit = buildUnitDto(child.unitId, child.unit?.activeDetail, null, undefined);
    return {
        unit: buildUnitDto(child.relatedUnitId, child.relatedUnit?.activeDetail, parentUnit, undefined),
        allocatedQuantity: null,
        types: buildFavoriteItemTypes(reportTypeIds, child.relatedUnitId, materialId, yesterdayInventoryQuantityByUnitMaterial),
    };
});
const buildFavoriteReportsResponse = (materials, childrenUnits, reportTypeIds, yesterdayInventoryReports) => {
    if (!materials?.length)
        return [];
    const yesterdayInventoryQuantityByUnitMaterial = buildYesterdayInventoryQuantityByUnitMaterial(yesterdayInventoryReports);
    return materials
        .map((material) => ({
        material,
        items: buildFavoriteItems(material.id, childrenUnits, reportTypeIds.filter(reportTypeId => material.type === constants_1.MATERIAL_TYPES.TOOL
            ? reportTypeId === constants_1.REPORT_TYPES.INVENTORY
            : true), yesterdayInventoryQuantityByUnitMaterial),
    }))
        .sort((a, b) => a.material.id.localeCompare(b.material.id));
};
exports.buildFavoriteReportsResponse = buildFavoriteReportsResponse;
//# sourceMappingURL=report-fetch.utils.js.map