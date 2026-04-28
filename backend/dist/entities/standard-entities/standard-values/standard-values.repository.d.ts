import { StandardValues } from "./standard-values.model";
export declare class StandardValuesRepository {
    private readonly standardValuesModel;
    constructor(standardValuesModel: typeof StandardValues);
    fetchByTagId(tagId: number): Promise<StandardValues[]>;
    fetchByTagGroupId(tagGroupId: number): Promise<StandardValues[]>;
}
