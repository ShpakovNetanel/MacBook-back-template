import { BadGatewayException, Injectable } from "@nestjs/common";
import { TagGroupRepository } from "./tag-group.repository";
import { ITagGroup } from "./tag-group.model";
import { MESSAGE_TYPES } from "src/contants";

@Injectable()
export class TagGroupService {
    constructor(private readonly repository: TagGroupRepository) { }

    async fetchAll() {
        const tagsGroups = await this.repository.fetchAll();

        return tagsGroups.map(tagGroup => ({
            description: tagGroup.dataValues.description,
            tags: tagGroup.tags?.map(tag => ({
                description: tag.dataValues.tag,
                unitLevel: tag.dataValues.unitLevel
            }))
        }));
    }

    async createTagGroup(description: string) {
        try {
            await this.repository.createTagGroup({ description } as ITagGroup);

            return {
                message: `התגית ${description} נשמרה בהצלחה`,
                type: MESSAGE_TYPES.SUCCESS
            }
        } catch (error) {
            console.log(error);

            throw new BadGatewayException({
                message: `נכשלה שמירת התגית ${description}, יש לנסות שנית`,
                type: MESSAGE_TYPES.FAILURE
            })
        }
    }
}