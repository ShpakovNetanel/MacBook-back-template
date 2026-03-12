import { BadGatewayException, Injectable } from "@nestjs/common";
import { StandardTagRepository } from "./standard-tag.repository";
import { CreateTagDTO } from "./standard-tag.types";
import { IStandardTag } from "./standard-tag.model";
import { MESSAGE_TYPES } from "src/contants";

@Injectable()
export class StandardTagService {
    constructor(private readonly repository: StandardTagRepository) { }

    async createTag(createTag: CreateTagDTO) {
        try {
            console.log({ createTag });

            await this.repository.createTag(createTag as IStandardTag);

            return {
                message: `התגית ${createTag.tag} נוצרה בהצלחה תחת ${createTag.tagGroupDescription}`,
                type: MESSAGE_TYPES.SUCCESS
            }
        } catch (error) {
            console.log(error);

            throw new BadGatewayException({
                message: `התגית ${createTag.tag} לא נוצרה, יש לנסות שוב`,
                type: MESSAGE_TYPES.FAILURE
            })
        }
    }
}