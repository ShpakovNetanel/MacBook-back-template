import { StandardTagService } from "./standard-tag.service";
import type { CreateTagDTO, DeleteTagDTO, UpdateTagDTO } from "./standard-tag.types";
export declare class StandardTagController {
    private readonly service;
    constructor(service: StandardTagService);
    createTag(createTag: CreateTagDTO): Promise<{
        message: string;
        type: string;
    }>;
    updateTag(updateTag: UpdateTagDTO): Promise<{
        message: string;
        type: string;
    }>;
    deleteTag(deleteTag: DeleteTagDTO): Promise<{
        message: string;
        type: string;
    }>;
}
