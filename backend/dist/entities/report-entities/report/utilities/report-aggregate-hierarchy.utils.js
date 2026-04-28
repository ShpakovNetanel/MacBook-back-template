"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAggregatedReports = exports.buildHierarchyReportsIndex = exports.buildChildrenByParentMap = exports.buildUnitsMap = exports.buildUnitResolver = exports.assertLowerHierarchyStable = exports.buildHierarchyIndexes = exports.upsertAggregateUnit = exports.buildAggregateUnitFromSource = exports.toParentDto = exports.collectHierarchyUnitIds = exports.sortNumeric = exports.DEFAULT_STATUS = void 0;
const common_1 = require("@nestjs/common");
const remeda_1 = require("remeda");
const constants_1 = require("../../../../constants");
const date_1 = require("../../../../utils/date");
const report_common_utils_1 = require("./report-common.utils");
exports.DEFAULT_STATUS = {
    id: 0,
    description: "בדיווח",
};
const sortNumeric = (values) => Array.from(new Set(values)).sort((a, b) => a - b);
exports.sortNumeric = sortNumeric;
const collectHierarchyUnitIds = (screenUnitId, childrenByParent) => {
    const visited = new Set([screenUnitId]);
    const queue = [screenUnitId];
    while (queue.length > 0) {
        const current = queue.shift();
        if (current === undefined)
            continue;
        for (const childId of childrenByParent.get(current) ?? []) {
            if (visited.has(childId))
                continue;
            visited.add(childId);
            queue.push(childId);
        }
    }
    return (0, exports.sortNumeric)(Array.from(visited));
};
exports.collectHierarchyUnitIds = collectHierarchyUnitIds;
const toParentDto = (unit) => ({
    id: unit.id,
    description: unit.description,
    level: unit.level,
    simul: unit.simul,
    status: unit.status,
    parent: null,
});
exports.toParentDto = toParentDto;
const buildAggregateUnitFromSource = (unitId, unit, emergencyUnitLookup) => {
    const detail = unit?.activeDetail?.dataValues ?? unit?.details?.[0]?.dataValues;
    const statusModel = unit?.unitStatus?.[0]?.unitStatus;
    const status = statusModel?.dataValues
        ?? (statusModel?.id ? { id: statusModel.id, description: statusModel.description ?? "" } : exports.DEFAULT_STATUS);
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
exports.buildAggregateUnitFromSource = buildAggregateUnitFromSource;
const upsertAggregateUnit = (unitsById, candidate) => {
    const existing = unitsById.get(candidate.id);
    if (!existing) {
        unitsById.set(candidate.id, candidate);
        return;
    }
    const merged = {
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
exports.upsertAggregateUnit = upsertAggregateUnit;
const buildHierarchyIndexes = (relations, emergencyUnitLookup) => {
    const childrenByParent = new Map();
    const parentsByChild = new Map();
    const unitsById = new Map();
    for (const relation of relations) {
        const parentId = relation.unitId;
        const childId = relation.relatedUnitId;
        const children = childrenByParent.get(parentId) ?? [];
        children.push(childId);
        childrenByParent.set(parentId, children);
        const parents = parentsByChild.get(childId) ?? [];
        parents.push(parentId);
        parentsByChild.set(childId, parents);
        (0, exports.upsertAggregateUnit)(unitsById, (0, exports.buildAggregateUnitFromSource)(parentId, relation.unit, emergencyUnitLookup));
        (0, exports.upsertAggregateUnit)(unitsById, (0, exports.buildAggregateUnitFromSource)(childId, relation.relatedUnit, emergencyUnitLookup));
    }
    return { childrenByParent, parentsByChild, unitsById };
};
exports.buildHierarchyIndexes = buildHierarchyIndexes;
const assertLowerHierarchyStable = (screenLowerUnits, dbLowerUnits) => {
    if ((0, remeda_1.isDefined)(screenLowerUnits) && !(0, report_common_utils_1.hasHierarchyChanged)([...screenLowerUnits], [...dbLowerUnits], []).changed)
        return;
    throw new common_1.BadGatewayException({
        message: 'ההיררכיה תחתיך השתנתה, יש לרענן את המסך',
        type: constants_1.MESSAGE_TYPES.FAILURE
    });
};
exports.assertLowerHierarchyStable = assertLowerHierarchyStable;
const buildUnitResolver = (unitsById, emergencyUnitLookup) => {
    return (unitId, source) => {
        const existing = unitsById.get(unitId);
        if (existing)
            return existing;
        const candidate = (0, exports.buildAggregateUnitFromSource)(unitId, source, emergencyUnitLookup);
        (0, exports.upsertAggregateUnit)(unitsById, candidate);
        return unitsById.get(unitId) ?? candidate;
    };
};
exports.buildUnitResolver = buildUnitResolver;
const buildUnitsMap = (connectedUnitIds, screenUnitId, parentsByChild, resolveUnit) => {
    const unitsMap = {};
    const unitIdsToBuild = new Set(connectedUnitIds);
    for (const parentId of parentsByChild.get(screenUnitId) ?? []) {
        unitIdsToBuild.add(parentId);
    }
    for (const unitId of (0, exports.sortNumeric)(Array.from(unitIdsToBuild))) {
        const unit = resolveUnit(unitId);
        const parentId = (0, exports.sortNumeric)(parentsByChild.get(unitId) ?? [])[0] ?? null;
        if (parentId !== null) {
            unit.parent = (0, exports.toParentDto)(resolveUnit(parentId));
        }
        unitsMap[unitId] = unit;
    }
    return unitsMap;
};
exports.buildUnitsMap = buildUnitsMap;
const buildChildrenByParentMap = (childrenByParent, connectedUnitSet, unitsMap, resolveUnit) => {
    const childrenByParentMap = {};
    for (const [parentId, children] of childrenByParent) {
        if (!connectedUnitSet.has(parentId))
            continue;
        const filteredChildren = (0, exports.sortNumeric)(children.filter((childId) => {
            if (!connectedUnitSet.has(childId))
                return false;
            const childUnit = unitsMap[childId] ?? resolveUnit(childId);
            return childUnit.parent?.id === parentId;
        }));
        if (filteredChildren.length === 0)
            continue;
        childrenByParentMap[parentId] = filteredChildren.map((childId) => unitsMap[childId] ?? resolveUnit(childId));
    }
    return childrenByParentMap;
};
exports.buildChildrenByParentMap = buildChildrenByParentMap;
const pushNumberKeyed = (record, key, value) => {
    if (!record[key]) {
        record[key] = [];
    }
    record[key].push(value);
};
const buildHierarchyReportsIndex = ({ dbReports, childrenByParentMap, }) => {
    const byUnitId = {};
    const childrenByParentUnitId = {};
    for (const [parentIdAsString, children] of Object.entries(childrenByParentMap)) {
        const parentId = Number(parentIdAsString);
        const childReports = {};
        for (const child of children) {
            childReports[child.id] = [];
        }
        childrenByParentUnitId[parentId] = childReports;
    }
    for (const report of dbReports) {
        pushNumberKeyed(byUnitId, report.unitId, report);
        if (report.recipientUnitId === null)
            continue;
        const parentChildrenReports = childrenByParentUnitId[report.recipientUnitId];
        if (!parentChildrenReports)
            continue;
        if (!parentChildrenReports[report.unitId])
            continue;
        parentChildrenReports[report.unitId].push(report);
    }
    return {
        all: dbReports,
        childrenByParentUnitId,
        getUnitReports: (unitId) => byUnitId[unitId] ?? [],
        getChildrenReports: (parentUnitId) => childrenByParentUnitId[parentUnitId] ?? {},
    };
};
exports.buildHierarchyReportsIndex = buildHierarchyReportsIndex;
const upsertReports = (reports, reportType, unitId, parentUnit, unitReport, screenUnitId, date, aggregatedMaterials, username) => {
    if (!aggregatedMaterials.length)
        return;
    const reportKey = `${unitId}::${parentUnit.id}::${reportType}`;
    const { formattedTime, timestamp } = (0, date_1.formatDate)(new Date());
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
        const quantity = Number(material.quantity);
        if (existing) {
            existing.reportedQuantity = quantity;
            existing.confirmedQuantity = quantity;
            existing.status = material.status;
            existing.modifiedAt = timestamp;
            existing.changedAt = formattedTime;
            existing.changedBy = username;
        }
        else {
            reports[reportKey].items[material.materialId] = {
                materialId: material.materialId,
                reportingUnitId: parentUnit?.id,
                reportingLevel: parentUnit?.level,
                reportedQuantity: quantity,
                confirmedQuantity: quantity,
                status: material.status,
                modifiedAt: timestamp,
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
                status: constants_1.RECORD_STATUS.INACTIVE,
                modifiedAt: timestamp,
                changedAt: formattedTime,
                changedBy: username,
            };
        }
    }
};
const toSafeQuantity = (value) => {
    const parsedQuantity = Number(value ?? 0);
    return Number.isNaN(parsedQuantity) ? 0 : parsedQuantity;
};
const mergeAggregatedMaterial = (aggregatedMaterials, candidate) => {
    const existing = aggregatedMaterials.find(material => material.materialId === candidate.materialId);
    const quantity = toSafeQuantity(candidate.quantity);
    if (!existing) {
        aggregatedMaterials.push({
            materialId: candidate.materialId,
            quantity,
            status: candidate.status,
        });
        return;
    }
    if (candidate.status === constants_1.RECORD_STATUS.ACTIVE) {
        if (existing.status === constants_1.RECORD_STATUS.ACTIVE) {
            existing.quantity += quantity;
        }
        else {
            existing.quantity = quantity;
            existing.status = constants_1.RECORD_STATUS.ACTIVE;
        }
        return;
    }
    if (existing.status !== constants_1.RECORD_STATUS.ACTIVE) {
        existing.quantity = quantity;
        existing.status = constants_1.RECORD_STATUS.INACTIVE;
    }
};
const applyUnitReportStatusOverride = (aggregatedMaterials, unitReport) => {
    for (const item of unitReport?.items ?? []) {
        const existing = aggregatedMaterials.find(material => material.materialId === item.materialId);
        const quantity = toSafeQuantity(item.confirmedQuantity ?? item.reportedQuantity);
        const status = item.status ?? constants_1.RECORD_STATUS.ACTIVE;
        if (existing) {
            existing.status = status;
            continue;
        }
        aggregatedMaterials.push({
            materialId: item.materialId,
            quantity,
            status,
        });
    }
};
const calculateReports = async (currentUnit, reportType, date, screenUnitId, unitsMap, childrenByParentMap, reports, hierarchyReportsIndex, username, isLaunching) => {
    let aggregatedMaterials = [];
    try {
        const parentUnit = unitsMap[currentUnit.parent?.id ?? -1];
        const unitReports = hierarchyReportsIndex.getUnitReports(currentUnit.id);
        const unitReport = unitReports.find((report) => report.reportTypeId === reportType &&
            report.recipientUnitId === parentUnit?.id);
        const childrenReports = Object
            .values(hierarchyReportsIndex.getChildrenReports(currentUnit.id))
            .flat()
            .filter(report => report.reportTypeId === reportType);
        const childrenUnits = childrenByParentMap[currentUnit.id] ?? [];
        if (currentUnit.level !== constants_1.UNIT_LEVELS.GDUD &&
            reportType !== constants_1.REPORT_TYPES.REQUEST &&
            ((unitReport && childrenUnits.every(child => !child.isEmergencyUnit))
                || ((0, remeda_1.isEmptyish)(childrenReports) && (0, remeda_1.isDefined)(unitReport)))) {
            aggregatedMaterials.push(...unitReport?.items?.map(item => ({
                materialId: item.materialId,
                quantity: 0,
                status: constants_1.RECORD_STATUS.ACTIVE,
            })) ?? []);
            upsertReports(reports, reportType, currentUnit.id, parentUnit, unitReport, screenUnitId, date, aggregatedMaterials, username);
        }
        if (((currentUnit.status.id === constants_1.UNIT_STATUSES.WAITING_FOR_ALLOCATION ||
            currentUnit.level === constants_1.UNIT_LEVELS.GDUD) && unitReport)) {
            for (const item of unitReport.items ?? []) {
                mergeAggregatedMaterial(aggregatedMaterials, {
                    materialId: item.materialId,
                    quantity: toSafeQuantity(item.confirmedQuantity ?? item.reportedQuantity),
                    status: item.status ?? constants_1.RECORD_STATUS.ACTIVE,
                });
            }
            upsertReports(reports, reportType, currentUnit.id, parentUnit, unitReport, screenUnitId, date, aggregatedMaterials, username);
            return aggregatedMaterials;
        }
        for (const unitChild of childrenUnits) {
            const childAggregation = await calculateReports(unitChild, reportType, date, screenUnitId, unitsMap, childrenByParentMap, reports, hierarchyReportsIndex, username, isLaunching);
            if (childAggregation.length) {
                for (const item of childAggregation) {
                    mergeAggregatedMaterial(aggregatedMaterials, item);
                }
            }
        }
        applyUnitReportStatusOverride(aggregatedMaterials, unitReport);
        upsertReports(reports, reportType, currentUnit.id, parentUnit, unitReport, screenUnitId, date, aggregatedMaterials, username);
        return aggregatedMaterials;
    }
    catch (error) {
        console.log(error);
        throw new common_1.BadGatewayException({
            message: 'העלאת הדיווחים נכשלה, יש לנסות שוב',
            type: constants_1.MESSAGE_TYPES.FAILURE
        });
    }
};
const formatReportsToDB = (reports) => {
    const reportsToDB = [];
    for (const key of Object.keys(reports)) {
        const header = reports[key];
        reportsToDB.push({
            header,
            items: Object.values(header.items)
        });
    }
    return reportsToDB;
};
const getAggregatedReports = async ({ date, unitsToLaunch, screenUnitId, unitsMap, childrenByParentMap, dbReports, username, isLaunching }) => {
    const reports = {};
    const hierarchyReportsIndex = (0, exports.buildHierarchyReportsIndex)({
        dbReports,
        childrenByParentMap,
    });
    const requestedUnits = (0, exports.sortNumeric)(Array.from(new Set(unitsToLaunch)));
    const requestedUnitsSet = new Set(requestedUnits);
    const rootLaunchUnits = requestedUnits.filter((unitId) => {
        let parentId = unitsMap[unitId]?.parent?.id ?? null;
        while (parentId !== null) {
            if (requestedUnitsSet.has(parentId))
                return false;
            parentId = unitsMap[parentId]?.parent?.id ?? null;
        }
        return true;
    });
    try {
        for (const unit of rootLaunchUnits) {
            const currentUnit = unitsMap[unit];
            if (!currentUnit)
                continue;
            for (const reportType of [constants_1.REPORT_TYPES.USAGE, constants_1.REPORT_TYPES.INVENTORY, constants_1.REPORT_TYPES.REQUEST]) {
                await calculateReports(currentUnit, reportType, date, screenUnitId, unitsMap, childrenByParentMap, reports, hierarchyReportsIndex, username, isLaunching);
            }
        }
        return formatReportsToDB(reports);
    }
    catch (error) {
        throw error;
    }
};
exports.getAggregatedReports = getAggregatedReports;
//# sourceMappingURL=report-aggregate-hierarchy.utils.js.map