import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, Transaction } from "sequelize";
import { Report } from "../report/report.model";
import { IReportItem, ReportItem } from "./report-item.model";
import { ReportItemKey } from "./report.types";

@Injectable()
export class ReportItemRepository {
    constructor(@InjectModel(Report) private readonly reportModel: typeof Report,
        @InjectModel(ReportItem) private readonly reportItemModel: typeof ReportItem) { }

    fetchReports(reportItemKey: ReportItemKey) {
        return this.reportModel.findAll({
            include: [{
                model: ReportItem,
                where: {
                    materialId: reportItemKey.materialId
                }
            }],
            where: {
                recipientUnitId: reportItemKey.recipientUnitId,
                reportTypeId: { [Op.in]: reportItemKey.reportsTypesIds },
                createdOn: reportItemKey.date
            }
        })
    }

    updateReportsItems(reportsItems: IReportItem[], transaction: Transaction) {
        return this.reportItemModel.bulkCreate(reportsItems,
            {
                transaction,
                conflictAttributes: ["reportId", "materialId", "reportingLevel"],
                updateOnDuplicate: ['status', 'confirmedQuantity', 'reportedQuantity', 'balanceQuantity']
            }
        )
    }
}
