import { MaterialDto, UnitDto } from "src/entities/report-entities/report/report.types";

export type StandardMaterialCategory = {
    id: string;
    description: string;
};

export type MaterialCategory = StandardMaterialCategory;

export type StandardOrigin = {
    standardId: number;
    toolGroups: MaterialDto | null;
    toolMaterialIds: string[];
    toolStockQuantity: number | null;
    perToolStockQuantity: number | null;
    tags: { level: number; tag: string }[];
    quantity: number | null;
    note: string | null;
};

export type ChildStandard = {
    unit: UnitDto;
    standardQuantity: number;
    stockQuantity: number;
    requisitionQuantity: number;
    origins: StandardOrigin[];
};

export type Standard = {
    totalStandardQuantity: number;
    childrenStockQuantity: number;
    childrenRequisitionQuantity: number;
    childrenStandards: ChildStandard[];
};

export type Stanadard = Standard;

export type MaterialsGroups = {
    materialGroup: MaterialDto;
    materialIds: string[];
    toolMaterialIds: string[];
    standards: Standard[];
};

export type StandardMaterialCategories = {
    materialCategory: StandardMaterialCategory;
    managingUnit: UnitDto;
    materialsGroups: MaterialsGroups[];
};

export type StandardResponse = {
    materialCategories: StandardMaterialCategories[];
};


export type RelevantStandard = {
    standardId: number;
    managingUnit: number;
    itemGroupId: string;
    toolGroupId: string | null;
    toolGroupName: string | null;
    lowestLevel: number;
    values: RelevantStandardValue[];
};

export type RelevantStandardValue = {
    tagId: number;
    tagLevel: number;
    tag: string;
    quantity: number | null;
    note: string | null;
};

export type CalculatedUnitStandard = {
    unitId: number;
    unitDescription: string;
    standardId: number;
    managingUnit: number;
    itemGroupId: string;
    toolGroupId: string | null;
    toolGroupName: string | null;
    standardQuantity: number;
    stockQuantity: number;
    toolQuantity: number | null;
    note: string | null;
    lowestLevel: number;
    origins: StandardOrigin[];
};
