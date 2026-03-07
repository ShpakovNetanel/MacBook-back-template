import { Transaction } from "sequelize"
import { IReportItem } from "../report-item/report-item.model"
import { IReport } from "./report.model"

export type SaveReportsBody = {
    changes: {
        materialId: string,
        type: number,
        unitId: number,
        quantity: number;
        status: string;
    }[],
    children: number[]
}

export type AggregateReportsDTO = {
    unitsIds: number[];
    lowerUnitsIds: number[];
}

export type AggregateUnitDto = UnitDto & {
    isEmergencyUnit: boolean;
};

export type AggregateHierarchyMapsDto = {
    unitIds: number[];
    lowerUnitsIds: number[];
    unitsMap: Record<number, AggregateUnitDto>;
    childrenByParentMap: Record<number, AggregateUnitDto[]>;
};

export type IReportsChanges = {
    header: IReport,
    items: IReportItem[]
}

export type ReportChanges = {
    transaction: Transaction,
    reportsToSave: IReportsChanges[],
    skipEmptyItems?: boolean;
}

export type UnitStatusDto = {
    id: number;
    description: string;
};

export type UnitDto = {
    id: number;
    description: string;
    level: number;
    simul: string;
    parent?: UnitDto | null;
    status: UnitStatusDto;
};

export type ReportItemTypeDto = {
    id: number;
    quantity: number;
    comment: string;
    status: string | null;
};

export type ReportItemDto = {
    unit: UnitDto;
    types: ReportItemTypeDto[];
};

export type MaterialDto = {
    id: string;
    description: string;
    multiply: number;
    nickname: string;
    category: string;
    unitOfMeasure: string;
};

export type ReportDto = {
    material: MaterialDto;
    comment: string;
    allocatedQuantity: number | null;
    items: ReportItemDto[];
};

export type FavoriteReportDto = {
    material: MaterialDto;
    items: ReportItemDto[];
};

export type InventoryCalculationResultDto = {
    materialId: string;
    unitId: number;
    quantity: number;
};

export type InventoryCalculationBody = {
    materialsIds: string[];
};

export type AggregatedMaterials = {
    materialId: string;
    quantity: number;
}
