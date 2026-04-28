import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Transaction } from "sequelize";
import { OBJECT_TYPES } from "../../../constants";
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
        recipientUnitObjectType: OBJECT_TYPES.UNIT,
        reporterUnitId,
        reporterUnitObjectType: OBJECT_TYPES.UNIT,
        createdBy,
      },
      {
        where: {
          unitId,
          unitObjectType: OBJECT_TYPES.UNIT,
          createdOn: date,
        },
        transaction,
      }
    );
  }
}
