export type DeleteItemsDTO = {
    reportTypes: number[];
    materialId: string;
};
export type EatAllocationDTO = {
    materialId: string;
    unitId: number;
    quantity: number;
    screenUnitId: number;
    date: string;
};
export type ReportItemKey = {
    recipientUnitId: number;
    reportsTypesIds: number[];
    materialId: string;
    date: string;
};
