import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Transaction } from "sequelize";
import { Report } from "./report.model";

@Injectable()
export class ReportRoutingRepository {
  constructor(
    @InjectModel(Report) private readonly reportModel: typeof Report,
  ) { }

  rerouteUnitReportsToParentForDate(
    unitId: number,
    date: string,
    recipientUnitId: number | null,
    reporterUnitId: number | null,
    createdBy: string | null,
    transaction?: Transaction
  ) {
    return this.reportModel.update(
      {
        recipientUnitId,
        reporterUnitId,
        createdBy,
      },
      {
        where: {
          unitId,
          createdOn: date,
        },
        transaction,
      }
    );
  }
}
