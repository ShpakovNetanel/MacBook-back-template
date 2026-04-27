export type ExcelRowInput = {
    reportType: number;
    unitSimul: string;
    materialId: string;
    quantity: number;
    rowNumber: number;
};

export type ScreenRowInput = {
    reportType: number;
    unitId: number;
    materialId: string;
    quantity: number;
};

export type ExcelImportBody = {
    excelRows?: ExcelRowInput[];
    screenRows?: ScreenRowInput[];
};

export type ExcelImportChange = {
    reportType: number;
    materialId: string;
    unitId: number;
    quantity: number;
};

export type ExcelImportFailure = {
    reportType: number;
    materialId: string;
    unitSimul: string;
    quantity: number;
    materialDesc: string;
    unitDesc: string;
    rowNumber: number;
    errorMessage: string;
};

export type NormalizedExcelRow = {
    reportType: number;
    unitSimul: string;
    materialId: string;
    quantity: number;
    rowNumber: number;
};

export type NormalizedScreenRow = {
    reportType: number;
    unitId: number;
    materialId: string;
    quantity: number;
};

export type ValidExcelRow = NormalizedExcelRow & {
    unitId: number;
};
