import { UnitStanadrdTagRepository } from "./unit-standard-tag.repository";
import { CreateUnitStandardTag, DeleteUnitStandardTag } from "./unit-standard-tag.types";
import { StandardTagRepository } from "../standard-tag/standard-tag.repository";
export declare class UnitStandardTagService {
    private readonly repository;
    private readonly standardTagRepository;
    constructor(repository: UnitStanadrdTagRepository, standardTagRepository: StandardTagRepository);
    createUnitStandardTag(createUnitStandardTag: CreateUnitStandardTag): Promise<{
        message: string;
        type: string;
    }>;
    removeUnitStandardTag(deleteUnitStandardTag: DeleteUnitStandardTag): Promise<{
        message: string;
        type: string;
    }>;
}
