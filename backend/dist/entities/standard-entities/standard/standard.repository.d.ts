import { Material } from "src/entities/material-entities/material/material.model";
import { Unit } from "src/entities/unit-entities/unit/unit.model";
import { UnitStatus } from "src/entities/unit-entities/units-statuses/units-statuses.model";
import { RelevantStandard } from "./standard.types";
import { CategoryDesc } from "../category-desc/category-desc.model";
import { CategoryGroup } from "../category-group/category-group.model";
import { UnitStandardTags } from "../unit-standard-tag/unit-standard-tag.model";
import { MaterialStandardGroup } from "../material-standard-group/material-standard-group.model";
import { StandardGroup } from "../standard-group/standard-group.model";
import { StandardAttribute } from "../standard-attribute/standard-attribute.model";
export declare class StandardRepository {
    private readonly standardAttributeModel;
    private readonly unitStandardTagModel;
    private readonly materialStandardGroupModel;
    private readonly categoryDescModel;
    private readonly categoryGroupModel;
    private readonly standardGroupModel;
    private readonly unitStatusModel;
    private readonly materialModel;
    private readonly unitModel;
    constructor(standardAttributeModel: typeof StandardAttribute, unitStandardTagModel: typeof UnitStandardTags, materialStandardGroupModel: typeof MaterialStandardGroup, categoryDescModel: typeof CategoryDesc, categoryGroupModel: typeof CategoryGroup, standardGroupModel: typeof StandardGroup, unitStatusModel: typeof UnitStatus, materialModel: typeof Material, unitModel: typeof Unit);
    getUnitStandardTags(unitIds: number[]): Promise<Map<number, Map<number, string>>>;
    getStandardsForItemGroups(itemGroupIds: string[]): Promise<RelevantStandard[]>;
    getAllCategories(): Promise<{
        groupToCategoryMap: Map<string, CategoryDesc>;
        categories: CategoryDesc[];
    }>;
    getAllItemGroupIds(): Promise<string[]>;
    getAllGroupToMaterialMappings(): Promise<Map<string, string[]>>;
    getUnitStatusesForDate(unitIds: number[], date: string): Promise<Map<number, number>>;
    getAllGroupNames(): Promise<Map<string, string>>;
    getUnitDetails(date: string, unitIds: number[]): Promise<{
        unitId: number;
        description: string | null;
        unitLevelId: number | null;
        simul: string | null;
    }[]>;
    getAllMaterials(): Promise<Map<string, string>>;
}
