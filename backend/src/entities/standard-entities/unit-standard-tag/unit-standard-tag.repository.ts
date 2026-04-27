import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { IUnitStandardTags, UnitStandardTags } from "./unit-standard-tag.model";

@Injectable()
export class UnitStanadrdTagRepository {
    constructor(@InjectModel(UnitStandardTags) private readonly unitStandardTags: typeof UnitStandardTags) { }

    fetchUnitStandardTag(unitStandardTag: IUnitStandardTags) {
        return this.unitStandardTags.findOne({
            where: unitStandardTag
        })
    }

    createUnitStandardTag(unitStandardTag: IUnitStandardTags) {
        return this.unitStandardTags.create(unitStandardTag)
    }

    removeUnitStandardTag(unitStandardTag: IUnitStandardTags) {
        return this.unitStandardTags.destroy({
            where: {
                unitId: unitStandardTag.unitId,
                tagId: unitStandardTag.tagId
            }
        })
    }
}