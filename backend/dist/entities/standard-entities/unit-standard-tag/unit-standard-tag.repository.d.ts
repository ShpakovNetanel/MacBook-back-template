import { IUnitStandardTags, UnitStandardTags } from "./unit-standard-tag.model";
export declare class UnitStanadrdTagRepository {
    private readonly unitStandardTags;
    constructor(unitStandardTags: typeof UnitStandardTags);
    fetchUnitStandardTag(unitStandardTag: IUnitStandardTags): Promise<UnitStandardTags | null>;
    createUnitStandardTag(unitStandardTag: IUnitStandardTags): Promise<UnitStandardTags>;
    removeUnitStandardTag(unitStandardTag: IUnitStandardTags): Promise<number>;
}
