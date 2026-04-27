import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { StandardValues } from "./standard-values.model";

@Injectable()
export class StandardValuesRepository {
    constructor(@InjectModel(StandardValues) private readonly standardValuesModel: typeof StandardValues) { }

    fetchByTagId(tagId: number) {
        return this.standardValuesModel.findAll({ where: { tagId } });
    }

    fetchByTagGroupId(tagGroupId: number) {
        return this.standardValuesModel.findAll({
            include: [{
                association: 'tag',
                where: { tagGroupId }
            }]
        });
    }
}