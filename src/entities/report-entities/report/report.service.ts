import { BadGatewayException, BadRequestException, Injectable, Logger } from "@nestjs/common";
import { isEmptyish } from "remeda";
import { Error } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { MESSAGE_TYPES, REPORT_TYPES, UNIT_LEVELS } from "../../../constants";
import { formatDate, getPreviousCalendarDate } from "../../../utils/date";
import { UnitHierarchyService } from "../../unit-entities/features/unit-hierarchy/unit-hierarchy.service";
import { UnitRelation } from "../../unit-entities/unit-relations/unit-relation.model";
import { UnitRepository } from "../../unit-entities/unit/unit.repository";
import { ReportRepository } from "./report.repository";
import {
    AggregateReportsDTO,
    FavoriteReportDto,
    InventoryCalculationResultDto,
    IReportsChanges,
    ReportDto,
    SaveAllocationsDTO,
    SaveCommitteesBody
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
    buildAllocationBalanceUpdates,
    buildAllocationsChanges,
    buildConfirmedAllocationChanges,
    buildDownloadAllocationChanges,
    buildNextLevelAllocationDraftChanges
} from "./utilities/report-allocation-save.utils";
import {
    buildFavoriteReportsResponse,
    buildReportsMaterialsResponse,
    buildReportsResponse
} from "./utilities/report-fetch.utils";
import { buildReportsToSave } from "./utilities/report-save.utils";
import {
    aggregateGdudQuantitiesToAncestors,
    buildChildIdsByParent,
    buildInventoryCalculationResults,
    buildParentByChildForConnectedUnits,
    buildUnitLevelById,
    buildUnitMaterialQuantityMap,
    collectMaterialIdsFromReports,
    collectUnitsForLockedDirectChildBranches,
} from "./utilities/report-service.utils";

@Injectable()
export class ReportService {
    private readonly logger = new Logger(ReportService.name);

    constructor(
        private readonly repository: ReportRepository,
        private readonly sequelize: Sequelize,
        private readonly unitHierarchyService: UnitHierarchyService,
        private readonly unitRepository: UnitRepository,
    ) { }

    async saveReportsChanges(
        saveReportsBody: SaveCommitteesBody,
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
            const unitDetails = await this.unitRepository.fetchActiveUnitDetails(screenDate, reportingUnitId);

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
                reportingLevel: unitDetails?.unitLevelId!,
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
                fieldsToUpdate: ["confirmedQuantity"],
            });

            await transaction.commit();
            return {
                type: MESSAGE_TYPES.SUCCESS,
                message: "הנתונים נשמרו בהצלחה"
            };
        } catch (error: any) {
            this.logger.error("Failed to save report changes", error instanceof Error ? error.stack : String(error));

            await transaction.rollback();
            throw new BadGatewayException({
                message: error?.response?.message ?? 'נכשלה פעולת השמירה, יש לנסות שוב',
                type: MESSAGE_TYPES.FAILURE
            })
        }
    }

    async fetchReports(date: string, recipientUnitId: number): Promise<ReportDto[]> {
        const baseReports = await this.repository.fetchReportsData(date, recipientUnitId);

        const [allocationReports, screenAllocationReports] = await Promise.all([
            this.repository.fetchAllocationReportsData(date, recipientUnitId),
            this.repository.fetchIncomingAllocationReports(date, recipientUnitId),
        ]);

        const reports = [...baseReports, ...allocationReports];
        const materialIds = collectMaterialIdsFromReports([
            ...reports,
            ...screenAllocationReports,
        ]);

        const yesterdayInventoryReports = materialIds.length === 0
            ? []
            : await this.repository.fetchHierarchyReportsByType(
                getPreviousCalendarDate(date),
                recipientUnitId,
                REPORT_TYPES.INVENTORY,
                materialIds
            );

        return buildReportsResponse({
            recipientUnitId,
            reports,
            yesterdayInventoryReports,
            screenAllocationReports,
        });
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
            const yesterdayInventoryReports = favoriteMaterials.length === 0
                ? []
                : await this.repository.fetchHierarchyReportsByType(
                    getPreviousCalendarDate(date),
                    recipientUnitId,
                    REPORT_TYPES.INVENTORY,
                    favoriteMaterials.map((material) => material.id)
                );

            const data = buildFavoriteReportsResponse(
                favoriteMaterials,
                directChildren,
                reportTypeIds,
                yesterdayInventoryReports
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
        } catch (error: any) {
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
            const materialIds = collectMaterialIdsFromReports(reports);
            const yesterdayInventoryReports = materialIds.length === 0
                ? []
                : await this.repository.fetchHierarchyReportsByType(
                    getPreviousCalendarDate(date),
                    recipientUnitId,
                    REPORT_TYPES.INVENTORY,
                    materialIds
                );

            return {
                data: buildReportsMaterialsResponse({
                    recipientUnitId,
                    reports,
                    yesterdayInventoryReports,
                    fetchQuantity: false
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
                transaction,
                fieldsToUpdate: ["confirmedQuantity", "reportedQuantity"],
            });

            await transaction.commit();

            return {
                type: isEmptyish(reportsToSave) ? MESSAGE_TYPES.WARNING : MESSAGE_TYPES.SUCCESS,
                message: isEmptyish(reportsToSave) ? 'אין דיווחים להעלות' : 'הדיווחים הועלו בהצלחה',
            };
        } catch (error: any) {
            await transaction.rollback();

            this.logger.error("Failed to aggregate hierarchy", error instanceof Error ? error.stack : String(error));
            throw new BadGatewayException({
                message: error?.response?.message ?? 'נעילת ההיררכיה נכשלה, יש לנסות שוב',
                type: MESSAGE_TYPES.FAILURE
            });
        }
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

            const connectedUnitIds = collectUnitsForLockedDirectChildBranches(
                screenUnitId,
                childrenByParent,
                unitsById
            );
            const connectedUnitSet = new Set<number>(connectedUnitIds);
            const gdudUnitIds = connectedUnitIds.filter(
                (unitId) => (unitsById.get(unitId)?.level) === UNIT_LEVELS.GDUD
            );

            const parentByChild = buildParentByChildForConnectedUnits(
                connectedUnitIds,
                parentsByChild,
                connectedUnitSet
            );

            const previousDate = getPreviousCalendarDate(date);

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

            const inventoryByUnitMaterial = buildUnitMaterialQuantityMap(yesterdayInventory);
            const usageByUnitMaterial = buildUnitMaterialQuantityMap(todayUsage);

            const aggregatedInventoryByUnitMaterial = aggregateGdudQuantitiesToAncestors(
                inventoryByUnitMaterial,
                parentByChild,
                connectedUnitSet,
                screenUnitId,
                true
            );
            const aggregatedUsageByUnitMaterial = aggregateGdudQuantitiesToAncestors(
                usageByUnitMaterial,
                parentByChild,
                connectedUnitSet,
                screenUnitId,
                true
            );
            const data = buildInventoryCalculationResults(
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
        } catch (error: any) {
            console.log(error.response.message);

            throw new BadGatewayException({
                message: error?.response?.message ?? 'חישוב המלאי נכשל, יש לנסות שנית',
                type: MESSAGE_TYPES.FAILURE
            })
        }
    }

    async saveAllocations(
        saveAllocationsDTO: SaveAllocationsDTO,
        date: string,
        screenUnitId: number,
        username: string,
    ) {
        const transaction = await this.sequelize.transaction();
        const { formattedTime } = formatDate(new Date());

        try {
            const unitDetails = await this.unitRepository.fetchActiveUnitDetails(date, screenUnitId);
            const reportsToSave: IReportsChanges[] = buildAllocationsChanges({
                changes: saveAllocationsDTO.changes,
                username,
                creationTime: formattedTime,
                screenUnit: unitDetails!,
                screenDate: new Date(date)
            });

            await this.repository.saveReports({
                reportsToSave,
                transaction,
                fieldsToUpdate: ["reportedQuantity"],
            });

            await transaction.commit();
            return {
                type: MESSAGE_TYPES.SUCCESS,
                message: "הקצאות נשמרו בהצלחה"
            };
        } catch (error: any) {
            await transaction.rollback();

            throw new BadGatewayException({
                message: error?.response?.message ?? 'נכשלה שמירת ההקצאות, יש לנסות שוב',
                type: MESSAGE_TYPES.FAILURE
            })
        }
    }

    async downloadAllocations(
        date: string,
        screenUnitId: number,
        username: string,
        materialId?: string,
    ) {
        const transaction = await this.sequelize.transaction();
        const { formattedTime } = formatDate(new Date());

        try {
            const unitDetails = await this.unitRepository.fetchActiveUnitDetails(date, screenUnitId);
            const activeRelations = await this.unitHierarchyService.fetchActiveRelations(date) as UnitRelation[];
            const childIdsByParent = buildChildIdsByParent(activeRelations);
            const unitLevelById = buildUnitLevelById(activeRelations);
            const directChildIds = sortNumeric(childIdsByParent.get(screenUnitId) ?? []);

            const currentOutgoingAllocationReports = await this.repository.fetchOutgoingAllocationReports(
                date,
                screenUnitId,
                directChildIds,
                materialId ? [materialId] : []
            );

            const matkalRequisitionReports = unitDetails?.unitLevelId === UNIT_LEVELS.MATKAL
                ? await this.repository.fetchReportsForRecipientsByType(
                    date,
                    REPORT_TYPES.REQUEST,
                    [screenUnitId],
                    directChildIds,
                    materialId ? [materialId] : []
                )
                : [];

            const allocationChanges = buildDownloadAllocationChanges({
                isMatkal: unitDetails?.unitLevelId === UNIT_LEVELS.MATKAL,
                outgoingAllocationReports: currentOutgoingAllocationReports,
                requisitionReports: matkalRequisitionReports,
            });

            if (allocationChanges.length === 0) {
                await transaction.commit();
                return {
                    type: MESSAGE_TYPES.WARNING,
                    message: "אין הקצאות להורדה"
                };
            }

            const allocatedMaterialIds = Array.from(new Set(allocationChanges.map((change) => change.materialId)));
            const grandchildIds = Array.from(new Set(
                directChildIds.flatMap((childUnitId) => childIdsByParent.get(childUnitId) ?? [])
            ));

            const [incomingAllocationReports, downstreamRequisitionReports] = await Promise.all([
                unitDetails?.unitLevelId === UNIT_LEVELS.MATKAL
                    ? Promise.resolve([])
                    : this.repository.fetchIncomingAllocationReports(date, screenUnitId, allocatedMaterialIds),
                directChildIds.length === 0 || grandchildIds.length === 0
                    ? Promise.resolve([])
                    : this.repository.fetchReportsForRecipientsByType(
                        date,
                        REPORT_TYPES.REQUEST,
                        directChildIds,
                        grandchildIds,
                        allocatedMaterialIds
                    )
            ]);

            const confirmedAllocationReports: IReportsChanges[] = buildConfirmedAllocationChanges({
                changes: allocationChanges,
                username,
                creationTime: formattedTime,
                screenUnit: unitDetails!,
                screenDate: new Date(date)
            });

            const incomingBalanceUpdates = buildAllocationBalanceUpdates({
                allocationChanges,
                incomingAllocationReports,
                username,
                creationTime: formattedTime,
            });

            const nextLevelDraftReports = buildNextLevelAllocationDraftChanges({
                changes: allocationChanges,
                childIdsByParent,
                username,
                creationTime: formattedTime,
                screenDate: new Date(date),
                unitLevelById,
                requisitionReports: downstreamRequisitionReports,
            });

            await this.repository.saveReports({
                reportsToSave: [
                    ...confirmedAllocationReports,
                    ...incomingBalanceUpdates,
                ],
                transaction,
                fieldsToUpdate: ["reportedQuantity", "confirmedQuantity", "balanceQuantity"],
            });

            await this.repository.saveReports({
                reportsToSave: nextLevelDraftReports,
                transaction,
                fieldsToUpdate: ["reportedQuantity"],
            });

            await transaction.commit();
            return {
                type: MESSAGE_TYPES.SUCCESS,
                message: "הקצאות הורדו בהצלחה"
            };
        } catch (error: any) {
            await transaction.rollback();

            throw new BadGatewayException({
                message: error?.response?.message ?? 'נכשלה הורדת ההקצאות, יש לנסות שוב',
                type: MESSAGE_TYPES.FAILURE
            })
        }
    }
}
