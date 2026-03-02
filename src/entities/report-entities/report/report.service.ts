import { BadGatewayException, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { MESSAGE_TYPES, RECORD_STATUS } from "src/contants";
import { UnitHierarchyService } from "src/entities/unit-entities/features/unit-hierarchy/unit-hierarchy.service";
import { UnitRelation } from "src/entities/unit-entities/unit-relations/unit-relation.model";
import { Unit } from "src/entities/unit-entities/unit/unit.model";
import { formatDate } from "src/utils/date";
import { ReportRepository } from "./report.repository";
import {
    AggregateReportsDTO,
    ReportDto,
    SaveReportsBody,
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
import { buildReportsResponse } from "./utilities/report-fetch.utils";
import { buildReportsToSave } from "./utilities/report-save.utils";

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
        date: Date,
        recipientUnitId: number,
        username: string,
    ) {
        const changes = saveReportsBody?.changes ?? [];
        const reportingUnitId = recipientUnitId;
        const transaction = await this.sequelize.transaction();
        const { formattedTime } = formatDate(new Date())

        try {
            const unitDetails = await this.unitDetailModel.findOne({
                attributes: ["unitId", "unitLevelId", "startDate"],
                where: {
                    unitId: reportingUnitId,
                    startDate: { [Op.lte]: date },
                    endDate: { [Op.gt]: date }
                },
                order: [["startDate", "DESC"]]
            });

            const parentByChild = await this.repository.fetchParentUnits(
                date,
                Array.from(new Set(changes.map(change => change.unitId)))
            );

            const reportsToSave = buildReportsToSave({
                changes,
                reportingLevel: unitDetails?.dataValues.unitLevelId!,
                reportingUnitId,
                recipientUnitId,
                createdOn: date,
                createdAt: formattedTime,
                createdBy: username,
                recordStatus: RECORD_STATUS.ACTIVE,
                parentByChild
            });

            await this.repository.upsertReports({
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
                message: error,
                type: MESSAGE_TYPES.FAILURE
            })
        }
    }

    async fetchReports(date: string, recipientUnitId: number): Promise<ReportDto[]> {
        const reports = await this.repository.fetchReportsData(date, recipientUnitId);
        return buildReportsResponse({
            recipientUnitId,
            reports,
        });
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

            await this.repository.upsertReports({
                reportsToSave: reportsToSave ?? [],
                transaction
            });

            await transaction.commit();
            
            return {
                message: 'ההירככיה ננעלה בהצלחה',
                type: MESSAGE_TYPES.SUCCESS,
            };
        } catch (error) {
            await transaction.rollback();

            if (error instanceof BadGatewayException) {
                throw error;
            }

            this.logger.error("Failed to aggregate hierarchy", error instanceof Error ? error.stack : String(error));
            throw new BadGatewayException({
                message: 'נעילת ההיררכיה נכשלה, יש לנסות שוב',
                type: MESSAGE_TYPES.FAILURE
            });
        }
    }
}
