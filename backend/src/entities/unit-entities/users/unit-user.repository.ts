import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { UnitUser } from "./unit-user.model";
import { Op } from "sequelize";

@Injectable()
export class UnitUserRepository {
    constructor(@InjectModel(UnitUser) private readonly unitUser: typeof UnitUser) { }

    fetchUnitUser(username: string, date: string) {
        return this.unitUser.findOne({
            where: {
                userId: username,
                startDate: {
                    [Op.lte]: date,
                },
                endDate: {
                    [Op.gt]: date
                }
            }
        })
    }
}