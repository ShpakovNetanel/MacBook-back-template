import { BadGatewayException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { UnitDetail } from "src/entities/unit-entities/unit-details/unit-details.model";
import { ReportRepository } from "./report.repository";
import { SaveReportsBody } from "./report.types";
import { MESSAGE_TYPES, RECORD_STATUS } from "src/contants";
import { buildReportsResponse } from "./utilities/report-fetch.utils";
import { buildReportsToSave, getReportingLevel } from "./utilities/report-save.utils";

@Injectable()
export class ReportService {
    constructor(
        private readonly repository: ReportRepository,
        private readonly sequelize: Sequelize,
        @InjectModel(UnitDetail) private readonly unitDetailModel: typeof UnitDetail
    ) { }

    async saveReportsChanges(
        saveReportsBody: SaveReportsBody,
        date: string,
        recipientUnitId: number,
        username?: string,
    ) {
        const now = new Date(date);
        const changes = saveReportsBody?.changes ?? [];
        const reportingUnitId = recipientUnitId;
        const transaction = await this.sequelize.transaction();

        try {
            const unitDetails = await this.unitDetailModel.findAll({
                attributes: ["unitId", "unitLevelId", "startDate"],
                where: {
                    unitId: reportingUnitId,
                    startDate: { [Op.lt]: now },
                    endDate: { [Op.gte]: now }
                },
                order: [["startDate", "DESC"]]
            });

            const createdAt = now.toTimeString().slice(0, 8);
            const createdBy = username ?? "";

            const reportingLevel = getReportingLevel(unitDetails, reportingUnitId);
            const parentByChild = await this.repository.fetchParentUnits(
                date,
                Array.from(new Set(changes.map(change => change.unitId)))
            );

            const reportsToSave = buildReportsToSave({
                changes,
                reportingLevel,
                reportingUnitId,
                recipientUnitId,
                createdOn: now,
                createdAt,
                createdBy,
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
            console.log(error);

            await transaction.rollback();
            throw new BadGatewayException({
                message: error,
                type: MESSAGE_TYPES.FAILURE
            })
        }
    }

    async fetchReports(date: string, recipientUnitId: number) {
        const data = await this.repository.fetchReportsData(date, recipientUnitId);
        return buildReportsResponse({
            recipientUnitId,
            ...data
        });
    }
}
