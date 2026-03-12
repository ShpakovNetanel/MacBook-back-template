import { BadGatewayException, Injectable } from "@nestjs/common";
import { TagGroupRepository } from "./tag-group.repository";
import { ITagGroup } from "./tag-group.model";
import { MESSAGE_TYPES } from "src/contants";
import { CreateTagGroupDTO } from "./tag-group.types";
import { isDefined, isNullish } from "remeda";

@Injectable()
export class TagGroupService {
    constructor(private readonly repository: TagGroupRepository) { }

    async fetchAll() {
        const tagsGroups = await this.repository.fetchAll();

        return tagsGroups.map(tagGroup => ({
            id: tagGroup.dataValues.id,
            description: tagGroup.dataValues.description,
            tags: tagGroup.tags?.map(tag => ({
                id: tag.dataValues.id,
                description: tag.dataValues.tag,
                unitLevel: tag.dataValues.unitLevel
            }))
        })).sort((a, b) => a.description.localeCompare(b.description));
    }

    async createTagGroup(createTagGroupDTO: CreateTagGroupDTO) {
        try {
            const existingTag = await this.repository.fetchDescription(createTagGroupDTO.description);

            if (!isNullish(existingTag) && !isDefined(createTagGroupDTO.id)) {
                throw new BadGatewayException({
                    message: `קבוצת התגיות ${createTagGroupDTO.description} כבר קיימת, היצירה נכשלה`
                })
            }

            await this.repository.createTagGroup(createTagGroupDTO as ITagGroup);

            return {
                message: `התגית ${createTagGroupDTO.description} נשמרה בהצלחה`,
                type: MESSAGE_TYPES.SUCCESS
            }
        } catch (error) {
            console.log(error);

            throw new BadGatewayException({
                message: error?.response?.message ?? `נכשלה שמירת התגית ${createTagGroupDTO.description}, יש לנסות שנית`,
                type: MESSAGE_TYPES.FAILURE
            })
        }
    }
}