import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { IUnitStatusTypes, UnitStatusTypes } from "./units-statuses.model";

@Injectable()
export class UnitStatusTypesRepository {
    constructor(@InjectModel(UnitStatusTypes) private readonly unitStatusHistoryModel: typeof UnitStatusTypes) { }

    updateStatuses(unitsStatuses: IUnitStatusTypes[]) {
        return this.unitStatusHistoryModel.bulkCreate(unitsStatuses, {
            updateOnDuplicate: ['unitStatusId'],
        })
    }
}