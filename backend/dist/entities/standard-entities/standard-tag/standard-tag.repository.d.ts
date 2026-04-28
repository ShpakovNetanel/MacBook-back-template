import { IStandardTag, StandardTag } from "./standard-tag.model";
export declare class StandardTagRepository {
    private readonly standardTag;
    constructor(standardTag: typeof StandardTag);
    fetchByDescription(description: string, tagGroupId: number): Promise<StandardTag | null>;
    fetchById(id: number): Promise<StandardTag | null>;
    fetchIfUnitOnAnotherTagOnSameLevel(id: number, unitLevel: number, tagGroupId: number, unitId: number): Promise<StandardTag | null>;
    createTag(standardTag: IStandardTag): Promise<[StandardTag, boolean | null]>;
    updateTag(standardTag: IStandardTag): Promise<[StandardTag, boolean | null]>;
    deleteTag(id: number): Promise<number>;
}
