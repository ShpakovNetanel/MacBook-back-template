import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { IStandardTag, StandardTag } from "./standard-tag.model";

@Injectable()
export class StandardTagRepository {
    constructor(@InjectModel(StandardTag) private readonly standardTag: typeof StandardTag) { }

    fetchByDescription(description: string) {
        return this.standardTag.findOne({
            where: {
                tag: description
            }
        })
    }

    createTag(standardTag: IStandardTag) {
        return this.standardTag.upsert(standardTag)
    }
}