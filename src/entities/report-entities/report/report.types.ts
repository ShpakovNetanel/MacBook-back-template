import { Transaction } from "sequelize"
import { IReportItem } from "../report-item/report-item.model"
import { IReport } from "./report.model"

export type SaveReportsBody = {
    changes: {
        materialId: string,
        type: number,
        unitId: number,
        quantity: number
    }[],
    children: number[]
}

export type IReportsChanges = {
    header: IReport,
    items: IReportItem[]
}

export type ReportChanges = {
    transaction: Transaction,
    reportsToSave: IReportsChanges[],
    skipEmptyItems?: boolean;
}

export type VisibilityTypes = "hidden" | "visible";

export type UnitStatusDto = {
    id: number;
    description: string;
    visibility: VisibilityTypes;
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
    favorite: boolean;
};

export type ReportDto = {
    material: MaterialDto;
    comment: string;
    allocatedQuantity: number | null;
    items: ReportItemDto[];
};