import { StandardTagRepository } from "./standard-tag.repository";
import { CreateTagDTO, UpdateTagDTO } from "./standard-tag.types";
import { StandardValuesRepository } from "../standard-values/standard-values.repository";
export declare class StandardTagService {
    private readonly repository;
    private readonly standardValuesRepository;
    constructor(repository: StandardTagRepository, standardValuesRepository: StandardValuesRepository);
    createTag(createTag: CreateTagDTO): Promise<{
        message: string;
        type: string;
    }>;
    updateTag(updateTag: UpdateTagDTO): Promise<{
        message: string;
        type: string;
    }>;
    deleteTag(id: number): Promise<{
        message: string;
        type: string;
    }>;
}
