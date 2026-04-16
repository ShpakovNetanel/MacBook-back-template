// ─── Response DTOs matching frontend StandardDrawerData[] shape ───────────────
// Reference: MacBook-front-template/src/types/standardDrawer.ts
// Reference: StandardDrawer/Docs/TECHNICAL.md#StandardDrawerData Response Shape

export type StandardMaterialDto = {
    id: string;
    description: string;
};

export type StandardManagingUnitDto = {
    id: number;
    description: string;
    level: number;
    level_description: string;
};

export type StandardMaterialCategoryDto = {
    id: string;       // category_desc.id — VARCHAR(9)
    name: string;     // category_desc.description
};

export type StandardOriginDto = {
    standard_attribute_id: number;
    managing_unit: string;
    item_group_id: string;
    tool_group_id: string | null;
    tool_group_name: string | null;
    tool_quantity: number | null;
    per_tool_qty: number | null;
    tags: { level: number; tag: string }[];
    quantity: number | null;
};

export type StandardChildQuantityDto = {
    unit_id: number;
    unit_description: string;
    material: StandardMaterialDto;
    quantity: number;
    tool_quantity: number | null;
    stock_quantity: number;
    origins: StandardOriginDto[];
};

export type ChildQuantityDto = {
    unit_id: number;
    unit_description: string;
    material: StandardMaterialDto;
    requisition_quantity: number;
    stock_quantity: number;
};

export type StandardMaterialDataDto = {
    material: StandardMaterialDto;
    material_ids: string[];
    tool_material_ids: string[];
    standard_quantity: number;
    children_requisition_quantity: number;
    children_stock_quantity: number;
    standard_children_quantities: StandardChildQuantityDto[];
    children_quantities: ChildQuantityDto[];
};

export type StandardDrawerDataDto = {
    managing_unit: StandardManagingUnitDto;
    material_category: StandardMaterialCategoryDto;
    priority: number;
    materials: StandardMaterialDataDto[];
};

// ─── Internal calculation types ───────────────────────────────────────────────

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
    standardQuan: number;
    stockQuan: number;
    toolQuan: number | null;
    note: string | null;
    lowestLevel: number;
    origins: StandardOriginDto[];
};
