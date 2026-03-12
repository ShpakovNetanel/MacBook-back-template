import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ITagGroup, TagGroup } from "./tag-group.model";
import { StandardTag } from "../standard-tag/standard-tag.model";

@Injectable()
export class TagGroupRepository {
    constructor(@InjectModel(TagGroup) private readonly tagGroup: typeof TagGroup) { }

    fetchAll() {
        return this.tagGroup.findAll({
            include: [{
                model: StandardTag
            }]
        });
    }

    fetchDescription(description: string) {
        return this.tagGroup.findOne({
            where: {
                description
            }
        })
    }

    createTagGroup(tagGroup: ITagGroup) {
        return this.tagGroup.upsert(tagGroup)
    }
}