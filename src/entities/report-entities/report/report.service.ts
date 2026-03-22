import { BadGatewayException, BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { MESSAGE_TYPES, REPORT_TYPES, UNIT_LEVELS, UNIT_STATUSES } from "src/contants";
import { UnitHierarchyService } from "src/entities/unit-entities/features/unit-hierarchy/unit-hierarchy.service";
import { UnitRelation } from "src/entities/unit-entities/unit-relations/unit-relation.model";
import { Unit } from "src/entities/unit-entities/unit/unit.model";
import { formatDate } from "src/utils/date";
import type { Report } from "./report.model";
import { ReportRepository } from "./report.repository";
import {
    AggregateUnitDto,
    AggregateReportsDTO,
    FavoriteReportDto,
    InventoryCalculationResultDto,
    ReportDto,
    SaveReportsBody
} from "./report.types";
import {
    assertLowerHierarchyStable,
    buildChildrenByParentMap,
    buildHierarchyIndexes,
    buildUnitResolver,
    buildUnitsMap,
    collectHierarchyUnitIds,
    getAggregatedReports,
    sortNumeric,
} from "./utilities/report-aggregate-hierarchy.utils";
import {
    buildFavoriteReportsResponse,
    buildReportsMaterialsResponse,
    buildReportsResponse
} from "./utilities/report-fetch.utils";
import { buildReportsToSave } from "./utilities/report-save.utils";
import { isEmptyish } from "remeda";

@Injectable()
export class ReportService {
    private readonly logger = new Logger(ReportService.name);

    constructor(
        private readonly repository: ReportRepository,
        private readonly sequelize: Sequelize,
        private readonly unitHierarchyService: UnitHierarchyService,
        @InjectModel(Unit) private readonly unitDetailModel: typeof Unit
    ) { }

    async saveReportsChanges(
        saveReportsBody: SaveReportsBody,
        date: string,
        screenUnitId: number,
        username: string,
    ) {
        const changes = saveReportsBody?.changes ?? [];
        const reportingUnitId = screenUnitId;
        const transaction = await this.sequelize.transaction();
        const { formattedTime } = formatDate(new Date());
        const screenDate = new Date(date);

        try {
            const unitDetails = await this.unitDetailModel.findOne({
                attributes: ["unitId", "unitLevelId", "startDate"],
                where: {
                    unitId: reportingUnitId,
                    startDate: { [Op.lte]: screenDate },
                    endDate: { [Op.gt]: screenDate }
                },
                order: [["startDate", "DESC"]]
            });

            const activeRelations = await this.unitHierarchyService.fetchActiveRelations(date) as UnitRelation[];

            const lowerUnitsIds = sortNumeric(
                activeRelations.filter(reltion => reltion.dataValues.unitId === screenUnitId).map(unit => unit.dataValues.relatedUnitId)
            );

            assertLowerHierarchyStable(saveReportsBody.children, lowerUnitsIds);

            const parentByChild = await this.repository.fetchParentUnits(
                screenDate,
                Array.from(new Set(changes.map(change => change.unitId)))
            );

            const reportsToSave = buildReportsToSave({
                changes,
                reportingLevel: unitDetails?.dataValues.unitLevelId!,
                reportingUnitId,
                recipientUnitId: screenUnitId,
                createdOn: screenDate,
                createdAt: formattedTime,
                createdBy: username,
                parentByChild
            });

            await this.repository.saveReports({
                reportsToSave,
                transaction,
            });

            await transaction.commit();
            return {
                type: MESSAGE_TYPES.SUCCESS,
                message: "הנתונים נשמרו בהצלחה"
            };
        } catch (error) {
            this.logger.error("Failed to save report changes", error instanceof Error ? error.stack : String(error));

            await transaction.rollback();
            throw new BadGatewayException({
                message: error?.response?.message ?? 'נכשלה פעולת השמירה, יש לנסות שוב',
                type: MESSAGE_TYPES.FAILURE
            })
        }
    }

    async fetchReports(date: string, recipientUnitId: number): Promise<ReportDto[]> {
        const reports = await this.repository.fetchReportsData(date, recipientUnitId);
        const materialIds = this.collectMaterialIdsFromReports(reports);

        const yesterdayInventoryReports = materialIds.length === 0
            ? []
            : await this.repository.fetchHierarchyReportsByType(
                this.getPreviousCalendarDate(date),
                recipientUnitId,
                REPORT_TYPES.INVENTORY,
                materialIds
            );

        return buildReportsResponse({
            recipientUnitId,
            reports,
            yesterdayInventoryReports,
        });
    }

    private collectMaterialIdsFromReports(reports: Report[]): string[] {
        const materialIds = new Set<string>();

        for (const report of reports) {
            for (const item of report.items ?? []) {
                if (!item.materialId) continue;
                materialIds.add(item.materialId);
            }
        }

        return Array.from(materialIds);
    }

    async fetchFavoriteReports(date: string, recipientUnitId: number): Promise<{ data: FavoriteReportDto[]; message: string; type: string }> {
        try {

            const directChildren = await this.unitHierarchyService.fetchLowerUnits(date, recipientUnitId)

            const reportTypeIds = [
                REPORT_TYPES.REQUEST,
                REPORT_TYPES.INVENTORY,
                REPORT_TYPES.USAGE,
                REPORT_TYPES.ALLOCATION,
            ];

            const favoriteMaterials = await this.repository.fetchFavoriteMaterials(recipientUnitId);

            const data = buildFavoriteReportsResponse(
                favoriteMaterials,
                directChildren,
                reportTypeIds
            );

            if (isEmptyish(data)) {
                throw new BadGatewayException({
                    message: 'לא נמצאו מק״טים מועדפים',
                    type: MESSAGE_TYPES.FAILURE
                })
            }

            return {
                data: data,
                message: 'ייבוא המק״טים צלח',
                type: MESSAGE_TYPES.SUCCESS
            };
        } catch (error) {
            console.log(error);

            throw new BadGatewayException({
                message: error?.response?.message ?? 'הבאת מק״טים מועדפים נכשלה, יש לנסות שנית',
                type: MESSAGE_TYPES.FAILURE
            })
        }
    }

    async fetchMostRecentMaterials(date: string, recipientUnitId: number) {
        try {

            const reports = await this.repository.fetchMostRecentReportsData(date, recipientUnitId);

            return {
                data: buildReportsMaterialsResponse({
                    recipientUnitId,
                    reports,
                }),
                message: 'ייבוא המק״טים צלח',
                type: MESSAGE_TYPES.SUCCESS
            };
        } catch (error) {
            console.log(error);

            throw new BadGatewayException({
                message: 'נכשלה הבאת המק״טים מועדה אחרונה',
                type: MESSAGE_TYPES.FAILURE
            });
        }
    }

    async aggregateHierarchy(
        date: string,
        screenUnitId: number,
        user: string,
        aggregatedReportsDTO: AggregateReportsDTO
    ) {
        const transaction = await this.sequelize.transaction();

        try {
            const activeRelations = await this.unitHierarchyService.fetchActiveRelations(date) as UnitRelation[];
            const emergencyUnitLookup = this.unitHierarchyService.buildEmergencyUnitLookup(activeRelations);
            const { childrenByParent, parentsByChild, unitsById } = buildHierarchyIndexes(
                activeRelations,
                emergencyUnitLookup
            );

            const connectedUnitIds = collectHierarchyUnitIds(screenUnitId, childrenByParent);
            const connectedUnitSet = new Set<number>(connectedUnitIds);
            
            const lowerUnitsIds = sortNumeric(
                (childrenByParent.get(screenUnitId) ?? []).filter((unitId) => connectedUnitSet.has(unitId))
            );

            assertLowerHierarchyStable(aggregatedReportsDTO.lowerUnitsIds ?? [], lowerUnitsIds);

            const resolveUnit = buildUnitResolver(unitsById, emergencyUnitLookup);

            const unitsMap = buildUnitsMap(connectedUnitIds, screenUnitId, parentsByChild, resolveUnit);
            const childrenByParentMap = buildChildrenByParentMap(
                childrenByParent,
                connectedUnitSet,
                unitsMap,
                resolveUnit
            );
            const dbReports = await this.repository.fetchReportsDataForUnits(
                date,
                connectedUnitIds
            );

            const reportsToSave = await getAggregatedReports({
                date,
                unitsToLaunch: aggregatedReportsDTO.unitsIds,
                screenUnitId,
                unitsMap,
                childrenByParentMap,
                dbReports,
                username: user
            });

            await this.repository.saveReports({
                reportsToSave: reportsToSave ?? [],
                transaction
            });

            await transaction.commit();

            return {
                type: MESSAGE_TYPES.SUCCESS,
                message: isEmptyish(reportsToSave) ? 'אין דיווחים להעלות' : 'הדיווחים הועלו בהצלחה',
            };
        } catch (error) {
            await transaction.rollback();

            this.logger.error("Failed to aggregate hierarchy", error instanceof Error ? error.stack : String(error));
            throw new BadGatewayException({
                message: error?.response?.message ?? 'נעילת ההיררכיה נכשלה, יש לנסות שוב',
                type: MESSAGE_TYPES.FAILURE
            });
        }
    }

    private getPreviousCalendarDate(date: string): string {
        const [year, month, day] = date.split("-").map((value) => Number(value));
        const parsed = year && month && day
            ? new Date(year, month - 1, day)
            : new Date(date);

        parsed.setDate(parsed.getDate() - 1);

        const parsedYear = parsed.getFullYear();
        const parsedMonth = `${parsed.getMonth() + 1}`.padStart(2, "0");
        const parsedDay = `${parsed.getDate()}`.padStart(2, "0");

        return `${parsedYear}-${parsedMonth}-${parsedDay}`;
    }

    private buildParentByChildForConnectedUnits(
        connectedUnitIds: number[],
        parentsByChild: Map<number, number[]>,
        connectedUnitSet: Set<number>
    ): Map<number, number> {
        const parentByChild = new Map<number, number>();

        for (const childUnitId of connectedUnitIds) {
            const directParentId = sortNumeric(
                (parentsByChild.get(childUnitId) ?? []).filter((parentUnitId) => connectedUnitSet.has(parentUnitId))
            )[0];

            if (directParentId !== undefined) {
                parentByChild.set(childUnitId, directParentId);
            }
        }

        return parentByChild;
    }

    private buildUnitMaterialQuantityMap(
        quantities: Array<{ unitId: number; materialId: string; quantity: number }>
    ): Map<string, number> {
        const quantityByUnitMaterial = new Map<string, number>();

        for (const quantityRow of quantities) {
            const mapKey = `${quantityRow.unitId}:${quantityRow.materialId}`;
            quantityByUnitMaterial.set(
                mapKey,
                (quantityByUnitMaterial.get(mapKey) ?? 0) + Number(quantityRow.quantity ?? 0)
            );
        }

        return quantityByUnitMaterial;
    }

    private collectUnitsForLockedDirectChildBranches(
        screenUnitId: number,
        childrenByParent: Map<number, number[]>,
        unitsById: Map<number, AggregateUnitDto>
    ): number[] {
        const directChildIds = sortNumeric(childrenByParent.get(screenUnitId) ?? []);
        const lockedDirectChildIds = directChildIds.filter((directChildId) => {
            const statusId = unitsById.get(directChildId)?.status?.id ?? UNIT_STATUSES.REQUESTING;
            return statusId === UNIT_STATUSES.WAITING_FOR_ALLOCATION;
        });

        const includedUnitIds = new Set<number>([screenUnitId]);
        const queue = [...lockedDirectChildIds];

        while (queue.length > 0) {
            const currentUnitId = queue.shift();
            if (currentUnitId === undefined || includedUnitIds.has(currentUnitId)) continue;

            includedUnitIds.add(currentUnitId);

            for (const childUnitId of childrenByParent.get(currentUnitId) ?? []) {
                if (includedUnitIds.has(childUnitId)) continue;
                queue.push(childUnitId);
            }
        }

        return sortNumeric(Array.from(includedUnitIds));
    }

    private aggregateGdudQuantitiesToAncestors(
        gdudQuantitiesByUnitMaterial: Map<string, number>,
        parentByChild: Map<number, number>,
        connectedUnitSet: Set<number>,
        screenUnitId: number,
        includeGdudUnit: boolean = false
    ): Map<string, number> {
        const aggregatedByUnitMaterial = new Map<string, number>();

        for (const [unitMaterialKey, quantity] of gdudQuantitiesByUnitMaterial.entries()) {
            const [gdudUnitIdAsString, materialId] = unitMaterialKey.split(":");
            const gdudUnitId = Number(gdudUnitIdAsString);
            if (!gdudUnitId || !materialId) continue;

            if (includeGdudUnit && connectedUnitSet.has(gdudUnitId)) {
                const gdudKey = `${gdudUnitId}:${materialId}`;
                aggregatedByUnitMaterial.set(
                    gdudKey,
                    (aggregatedByUnitMaterial.get(gdudKey) ?? 0) + quantity
                );
            }

            let currentParentId = parentByChild.get(gdudUnitId);
            while (currentParentId !== undefined && connectedUnitSet.has(currentParentId)) {
                const parentKey = `${currentParentId}:${materialId}`;
                aggregatedByUnitMaterial.set(
                    parentKey,
                    (aggregatedByUnitMaterial.get(parentKey) ?? 0) + quantity
                );

                if (currentParentId === screenUnitId) break;
                currentParentId = parentByChild.get(currentParentId);
            }
        }

        return aggregatedByUnitMaterial;
    }

    private buildInventoryCalculationResults(
        aggregatedInventoryByUnitMaterial: Map<string, number>,
        aggregatedUsageByUnitMaterial: Map<string, number>
    ): InventoryCalculationResultDto[] {
        const allUnitMaterialKeys = new Set<string>([
            ...aggregatedInventoryByUnitMaterial.keys(),
            ...aggregatedUsageByUnitMaterial.keys(),
        ]);

        return Array
            .from(allUnitMaterialKeys)
            .map((unitMaterialKey) => {
                const [unitIdAsString, materialId] = unitMaterialKey.split(":");
                const aggregatedInventoryQuantity = aggregatedInventoryByUnitMaterial.get(unitMaterialKey) ?? 0;
                const aggregatedUsageQuantity = aggregatedUsageByUnitMaterial.get(unitMaterialKey) ?? 0;

                return {
                    materialId,
                    unitId: Number(unitIdAsString),
                    quantity: Math.max(aggregatedInventoryQuantity - aggregatedUsageQuantity, 0),
                };
            })
            .sort((left, right) => {
                if (left.unitId !== right.unitId) return left.unitId - right.unitId;
                return left.materialId.localeCompare(right.materialId);
            });
    }

    async inventoryCalculation(
        date: string,
        screenUnitId: number,
        materialIds: string[] = []
    ): Promise<{ data: InventoryCalculationResultDto[]; message: string; type: string }> {
        try {
            if (materialIds.length === 0) {
                throw new BadRequestException({
                    message: 'אין מק״טים לחשב עבורם מלאי',
                    type: MESSAGE_TYPES.FAILURE
                });
            }

            const activeRelations = await this.unitHierarchyService.fetchActiveRelations(date) as UnitRelation[];
            const emergencyUnitLookup = this.unitHierarchyService.buildEmergencyUnitLookup(activeRelations);
            const { childrenByParent, parentsByChild, unitsById } = buildHierarchyIndexes(
                activeRelations,
                emergencyUnitLookup
            );

            const connectedUnitIds = this.collectUnitsForLockedDirectChildBranches(
                screenUnitId,
                childrenByParent,
                unitsById
            );
            const connectedUnitSet = new Set<number>(connectedUnitIds);
            const gdudUnitIds = connectedUnitIds.filter(
                (unitId) => (unitsById.get(unitId)?.level) === UNIT_LEVELS.GDUD
            );

            const parentByChild = this.buildParentByChildForConnectedUnits(
                connectedUnitIds,
                parentsByChild,
                connectedUnitSet
            );

            const previousDate = this.getPreviousCalendarDate(date);

            const [yesterdayInventory, todayUsage] = await Promise.all([
                this.repository.fetchActiveReportItemQuantitiesByUnitAndMaterial(
                    previousDate,
                    REPORT_TYPES.INVENTORY,
                    materialIds,
                    gdudUnitIds
                ),
                this.repository.fetchActiveReportItemQuantitiesByUnitAndMaterial(
                    date,
                    REPORT_TYPES.USAGE,
                    materialIds,
                    gdudUnitIds
                ),
            ]);

            const inventoryByUnitMaterial = this.buildUnitMaterialQuantityMap(yesterdayInventory);
            const usageByUnitMaterial = this.buildUnitMaterialQuantityMap(todayUsage);

            const aggregatedInventoryByUnitMaterial = this.aggregateGdudQuantitiesToAncestors(
                inventoryByUnitMaterial,
                parentByChild,
                connectedUnitSet,
                screenUnitId,
                true
            );
            const aggregatedUsageByUnitMaterial = this.aggregateGdudQuantitiesToAncestors(
                usageByUnitMaterial,
                parentByChild,
                connectedUnitSet,
                screenUnitId,
                true
            );
            const data = this.buildInventoryCalculationResults(
                aggregatedInventoryByUnitMaterial,
                aggregatedUsageByUnitMaterial
            );

            if (isEmptyish(data)) {
                throw new BadGatewayException({
                    message: 'לא נמצא מלאי לחישוב',
                    type: MESSAGE_TYPES.FAILURE
                })
            }

            return {
                data: data,
                message: 'חישוב המלאי הצליח',
                type: MESSAGE_TYPES.SUCCESS
            }
        } catch (error) {
            console.log(error.response.message);

            throw new BadGatewayException({
                message: error?.response?.message ?? 'חישוב המלאי נכשל, יש לנסות שנית',
                type: MESSAGE_TYPES.FAILURE
            })
        }
    }
}
