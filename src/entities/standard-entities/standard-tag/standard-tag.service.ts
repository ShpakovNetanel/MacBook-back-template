import { BadGatewayException, Injectable } from "@nestjs/common";
import { StandardTagRepository } from "./standard-tag.repository";
import { CreateTagDTO, UpdateTagDTO } from "./standard-tag.types";
import { IStandardTag } from "./standard-tag.model";
import { MESSAGE_TYPES } from "src/contants";
import { isDefined, isNullish } from "remeda";

@Injectable()
export class StandardTagService {
    constructor(private readonly repository: StandardTagRepository) { }

    async createTag(createTag: CreateTagDTO) {
        try {
            const existingTag = await this.repository.fetchByDescription(createTag.tag,
                createTag.tagGroupId, createTag.unitLevel)

            if (!isNullish(existingTag)) {
                throw new BadGatewayException({
                    message: 'התגית קיימת לרמה הארגונית תחת קבוצה זו',
                    type: MESSAGE_TYPES.FAILURE
                })
            }

            await this.repository.createTag(createTag as IStandardTag);

            return {
                message: 'התגית נוצרה בהצלחה',
                type: MESSAGE_TYPES.SUCCESS
            }
        } catch (error) {
            console.log(error);

            throw new BadGatewayException({
                message: error?.response?.message ?? `התגית לא נוצרה, יש לנסות שוב`,
                type: MESSAGE_TYPES.FAILURE
            })
        }
    }

    async updateTag(updateTag: UpdateTagDTO) {
        try {
            const existingTag = await this.repository.fetchByDescription(updateTag.tag,
                updateTag.tagGroupId, updateTag.unitLevel)

            if (isDefined(existingTag) && existingTag?.dataValues.tag === updateTag.tag
                && existingTag.dataValues.unitLevel === updateTag.unitLevel) {
                throw new BadGatewayException({
                    message: 'התגית לא עודכנה, יש לבטל את הפעולה',
                    type: MESSAGE_TYPES.FAILURE
                })
            }

            await this.repository.updateTag(updateTag);

            return {
                message: 'התגית עודכנה בהצלחה',
                type: MESSAGE_TYPES.SUCCESS
            }
        } catch (error) {
            console.log(error);

            throw new BadGatewayException({
                message: error?.response?.message ?? `התגית לא עודכנה, יש לנסות שוב`,
                type: MESSAGE_TYPES.FAILURE
            })
        }
    }
}