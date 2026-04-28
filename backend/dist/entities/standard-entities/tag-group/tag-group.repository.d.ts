import { ITagGroup, TagGroup } from "./tag-group.model";
export declare class TagGroupRepository {
    private readonly tagGroup;
    constructor(tagGroup: typeof TagGroup);
    fetchAll(level: number): Promise<TagGroup[]>;
    fetchById(id: number): Promise<TagGroup | null>;
    fetchByDescription(description: string): Promise<TagGroup | null>;
    createTagGroup(tagGroup: ITagGroup): Promise<[TagGroup, boolean | null]>;
    updateTagGroup(tagGroup: ITagGroup): Promise<[TagGroup, boolean | null]>;
    deleteTagGroup(id: number): Promise<number>;
}
