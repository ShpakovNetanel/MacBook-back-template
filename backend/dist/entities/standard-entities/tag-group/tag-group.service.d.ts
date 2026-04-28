import { TagGroupRepository } from "./tag-group.repository";
import { CreateTagGroupDTO, UpdateTagGroupDTO } from "./tag-group.types";
import { StandardValuesRepository } from "../standard-values/standard-values.repository";
export declare class TagGroupService {
    private readonly repository;
    private readonly standardValuesRepository;
    constructor(repository: TagGroupRepository, standardValuesRepository: StandardValuesRepository);
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
    updateTagGroupDTO(updateTagGroupDTO: UpdateTagGroupDTO): Promise<{
        message: string;
        type: string;
    }>;
    deleteTagGroup(id: number): Promise<{
        message: string;
        type: string;
    }>;
}
