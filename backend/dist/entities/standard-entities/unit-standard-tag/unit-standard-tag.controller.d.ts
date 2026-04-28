import { UnitStandardTagService } from "./unit-standard-tag.service";
import type { CreateUnitStandardTag, DeleteUnitStandardTag } from "./unit-standard-tag.types";
export declare class UnitStandardTagController {
    private readonly service;
    constructor(service: UnitStandardTagService);
    createUnitStandardTag(createUnitStandardTag: CreateUnitStandardTag): Promise<{
        message: string;
        type: string;
    }>;
    removeUnitStandardTag(deleteUnitStandardTag: DeleteUnitStandardTag): Promise<{
        message: string;
        type: string;
    }>;
}
