import { Material } from "../../material-entities/material/material.model";
import { UnitFavoriteMaterial } from "../../material-entities/unit-favorite-material/unit-favorite-material.model";
import { MaterialStandardGroup } from "../../standard-entities/material-standard-group/material-standard-group.model";
import { StandardGroup } from "../../standard-entities/standard-group/standard-group.model";
import { UnitRelation } from "../../unit-entities/unit-relations/unit-relation.model";
import { ReportItem } from "../report-item/report-item.model";
import { Report } from "./report.model";
import { MaterialDto, ReportChanges, ReportItemConflictField } from "./report.types";
export type StandardGroupMaterialRow = {
    groupId: string;
    groupDescription: string;
    materialId: string;
    materialDescription: string;
    unitOfMeasurement: string;
};
export declare class ReportRepository {
    private readonly reportModel;
    private readonly reportItemModel;
    private readonly unitFavoriteMaterialModel;
    private readonly unitRelationModel;
    private readonly materialModel;
    private readonly materialStandardGroupModel;
    private readonly standardGroupModel;
    private readonly logger;
    constructor(reportModel: typeof Report, reportItemModel: typeof ReportItem, unitFavoriteMaterialModel: typeof UnitFavoriteMaterial, unitRelationModel: typeof UnitRelation, materialModel: typeof Material, materialStandardGroupModel: typeof MaterialStandardGroup, standardGroupModel: typeof StandardGroup);
    saveReports<Key extends ReportItemConflictField>({ reportsToSave, transaction, skipEmptyItems, fieldsToUpdate }: ReportChanges<Key>): Promise<void>;
    fetchParentUnits(date: Date, childUnitIds: number[]): Promise<Map<number, number>>;
    fetchDescendantUnits(date: Date, rootUnitId: number): Promise<{
        descendantIds: number[];
        parentByChild: Map<number, number>;
    }>;
    fetchReportsByTypeAndUnitsForMaterials(date: string, reportType: number, materials: string[] | undefined, units: number[]): Promise<Report[]>;
    fetchActiveReportItemQuantitiesByUnitAndMaterial(date: string, reportType: number, materialIds: string[], unitIds: number[]): Promise<Array<{
        unitId: number;
        materialId: string;
        quantity: number;
    }>>;
    fetchActiveReportItemQuantitiesByUnitMaterialAndType(date: string, reportTypeIds: number[], materialIds: string[], unitIds: number[]): Promise<Array<{
        unitId: number;
        materialId: string;
        reportTypeId: number;
        quantity: number;
    }>>;
    fetchReportsData(date: string, recipientUnitId: number, material?: string | undefined): Promise<Report[]>;
    fetchAllocationReportsData(date: string, recipientUnitId: number): Promise<Report[]>;
    fetchReportsForRecipientsByType(date: string, reportTypeId: number, recipientUnitIds: number[], reportingUnitIds?: number[], materialIds?: string[]): Promise<Report[]>;
    fetchIncomingAllocationReports(date: string, recipientUnitId: number, materialIds?: string[]): Promise<Report[]>;
    fetchOutgoingAllocationReports(date: string, unitId: number, recipientUnitIds: number[], materialIds?: string[]): Promise<Report[]>;
    fetchStandardGroupMaterials(groupIds: string[]): Promise<StandardGroupMaterialRow[]>;
    fetchFavoriteReportsData(date: string, recipientUnitId: number): Promise<Report[]>;
    fetchFavoriteMaterials(recipientUnitId: number): Promise<MaterialDto[]>;
    fetchMostRecentReportsData(date: string, recipientUnitId: number): Promise<Report[]>;
    fetchHierarchyReportsByType(date: string, recipientUnitId: number, reportTypeId: number, materialIds?: string[]): Promise<Report[]>;
    fetchReportsDataForUnits(date: string, unitIds: number[]): Promise<Report[]>;
    private buildReportScope;
    fetchReportsByScope({ date, reportingUnitIds, recipientUnitIds, reportTypeIds, material, itemStatuses, materialIds }: {
        date: string;
        reportingUnitIds?: number[];
        recipientUnitIds?: number[];
        reportTypeIds?: number[];
        material?: string;
        itemStatuses?: string[];
        materialIds?: string[];
    }): Promise<Report[]>;
    private buildReportsInclude;
}
