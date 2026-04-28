import { MaterialDto, UnitDto } from "src/entities/report-entities/report/report.types";
import { Report } from "src/entities/report-entities/report/report.model";
import { CategoryDesc } from "../../category-desc/category-desc.model";
import { CalculatedUnitStandard, RelevantStandard, StandardOrigin, StandardResponse } from "../standard.types";
export type LiveMaterialData = {
    stockQuantity: number;
    requisitionQuantity: number;
};
export type UnitInfo = {
    description: string;
    level: number;
    simul: string;
};
type ActiveUnitRelation = {
    unitId: number;
    relatedUnitId: number;
};
export declare const parseQuantityValue: (value: string | number | null | undefined) => number;
export declare const buildHierarchyLookups: (relations: ActiveUnitRelation[]) => {
    parentUnitIdByChildUnitId: Map<number, number>;
    childUnitIdsByParentUnitId: Map<number, number[]>;
};
export declare const getAncestorUnitIds: (unitId: number, parentUnitIdByChildUnitId: Map<number, number>) => number[];
export declare const getDescendantUnitIds: (rootUnitId: number, childUnitIdsByParentUnitId: Map<number, number[]>) => number[];
export declare const getEligibleStandardChildUnitIds: (childUnitIds: number[], unitStatusByUnitId: Map<number, number>) => number[];
export declare const buildUnitInfoByUnitId: (unitDetails: {
    unitId: number;
    description: string | null;
    unitLevelId: number | null;
    simul: string | null;
}[]) => Map<number, UnitInfo>;
export declare const filterStandardsByAncestorTags: (standards: RelevantStandard[], ancestorUnitIds: number[], unitTagsByUnit: Map<number, Map<number, string>>) => RelevantStandard[];
export declare const calculateStandardsForUnit: (unitId: number, unitDescription: string, unitTagsByLevel: Map<number, string>, relevantStandards: RelevantStandard[], liveDataByUnit: Map<number, Map<string, LiveMaterialData>>, childUnitIdsByParentUnitId: Map<number, number[]>, unitInfoByUnitId: Map<number, UnitInfo>, unitTagsByUnit: Map<number, Map<number, string>>, groupToMaterialMap: Map<string, string[]>) => CalculatedUnitStandard[];
export declare const buildStandardResponse: (calculatedStandards: CalculatedUnitStandard[], groupToCategoryMap: Map<string, CategoryDesc>, unitInfoByUnitId: Map<number, UnitInfo>, allMaterials: Map<string, string>, allGroupNames: Map<string, string>, groupToMaterialMap: Map<string, string[]>, liveDataByUnit: Map<number, Map<string, LiveMaterialData>>) => StandardResponse;
export declare const buildLiveMaterialDataByUnitId: (reports: Report[]) => Map<number, Map<string, LiveMaterialData>>;
export declare const sumMaterialGroupQuantity: (unitLiveData: Map<string, LiveMaterialData>, groupId: string, groupToMaterialMap: Map<string, string[]>, field: keyof LiveMaterialData) => number;
export declare const buildStandardOriginDetails: (standard: RelevantStandard, baseQuantity: number, toolCount: number | null, groupToMaterialMap: Map<string, string[]>) => StandardOrigin[];
export declare const buildStandardUnitDto: (unitId: number, unitInfoByUnitId: Map<number, UnitInfo>) => UnitDto;
export declare const buildStandardMaterialDto: (id: string, description: string, category: string, type?: string) => MaterialDto;
export {};
