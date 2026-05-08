import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, Transaction } from "sequelize";
import { OBJECT_TYPES } from "../../../constants";
import { Report } from "../report/report.model";
import { IReportItem, ReportItem } from "./report-item.model";
import { ReportItemKey } from "./report.types";
import { isNullish } from "remeda";

@Injectable()
export class ReportItemRepository {
    constructor(@InjectModel(Report) private readonly reportModel: typeof Report,
        @InjectModel(ReportItem) private readonly reportItemModel: typeof ReportItem) { }

    fetchReports(reportItemKey: ReportItemKey) {
        const reportWhereClause: any = {};
        const reportItemWhereClause: any = {};

        if(!isNullish(reportItemKey.materialId))
            reportWhereClause.materialId = reportItemKey.materialId;
        
        if(!isNullish(reportItemKey.recipientUnitId))
            reportItemWhereClause.recipientUnitId = reportItemKey.recipientUnitId;

        return this.reportModel.findAll({
            include: [{
                model: ReportItem,
                where: {
                    ...reportWhereClause,
                    reportingUnitObjectType: OBJECT_TYPES.UNIT,
                }
            }],
            where: {
                ...reportItemWhereClause,
                unitObjectType: OBJECT_TYPES.UNIT,
                recipientUnitObjectType: OBJECT_TYPES.UNIT,
                reporterUnitObjectType: OBJECT_TYPES.UNIT,
                reportTypeId: { [Op.in]: reportItemKey.reportsTypesIds },
                createdOn: reportItemKey.date
            }
        })
    }

    updateReportsItems(reportsItems: IReportItem[], transaction?: Transaction) {
        return this.reportItemModel.bulkCreate(reportsItems,
            {
                transaction,
                conflictAttributes: ["reportId", "materialId", "reportingLevel"],
                updateOnDuplicate: ['status', 'confirmedQuantity', 'reportedQuantity', 'balanceQuantity']
            }
        )
    }
}
