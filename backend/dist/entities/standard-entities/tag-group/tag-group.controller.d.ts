import type { CreateTagGroupDTO, DeleteTagGroupDTO, UpdateTagGroupDTO } from "./tag-group.types";
import { TagGroupService } from "./tag-group.service";
export declare class TagGroupController {
    private readonly service;
    constructor(service: TagGroupService);
    fetchAll(level: number): Promise<{
        id: number | undefined;
        description: string;
        tags: {
            id: number;
            description: string;
            unitLevel: number;
            units: {
                id: number | undefined;
                description: string | null | undefined;
            }[];
        }[] | undefined;
    }[]>;
    createTagGroup(createTagGroupDTO: CreateTagGroupDTO): Promise<{
        message: string;
        type: string;
    }>;
    updateTagGroup(updateTagGroupDTO: UpdateTagGroupDTO): Promise<{
        message: string;
        type: string;
    }>;
    deleteTagGroup(deleteTagGroupDTO: DeleteTagGroupDTO): Promise<{
        message: string;
        type: string;
    }>;
}
