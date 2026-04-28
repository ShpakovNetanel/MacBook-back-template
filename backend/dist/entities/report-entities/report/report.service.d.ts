import { Sequelize } from "sequelize-typescript";
import { UnitHierarchyService } from "../../unit-entities/features/unit-hierarchy/unit-hierarchy.service";
import { UnitRepository } from "../../unit-entities/unit/unit.repository";
import { ReportRepository } from "./report.repository";
import { AllocationDuhExportDto, AggregateReportsDTO, FavoriteReportDto, InventoryCalculationResultDto, ReportDto, SaveAllocationsDTO, SaveCommitteesBody } from "./report.types";
export declare class ReportService {
    private readonly repository;
    private readonly sequelize;
    private readonly unitHierarchyService;
    private readonly unitRepository;
    private readonly logger;
    constructor(repository: ReportRepository, sequelize: Sequelize, unitHierarchyService: UnitHierarchyService, unitRepository: UnitRepository);
    saveReportsChanges(saveReportsBody: SaveCommitteesBody, date: string, screenUnitId: number, username: string): Promise<{
        type: string;
        message: string;
    }>;
    fetchReports(date: string, recipientUnitId: number): Promise<ReportDto[]>;
    fetchFavoriteReports(date: string, recipientUnitId: number): Promise<{
        data: FavoriteReportDto[];
        message: string;
        type: string;
    }>;
    fetchMostRecentMaterials(date: string, recipientUnitId: number): Promise<{
        data: ReportDto[];
        message: string;
        type: string;
    }>;
    aggregateHierarchy(date: string, screenUnitId: number, user: string, aggregatedReportsDTO: AggregateReportsDTO): Promise<{
        type: string;
        message: string;
    }>;
    inventoryCalculation(date: string, screenUnitId: number, materialIds?: string[]): Promise<{
        data: InventoryCalculationResultDto[];
        message: string;
        type: string;
    }>;
    private buildAllocationDuhUnitMap;
    private buildAllocationDuhSourceMaterialMap;
    private buildAllocationDuhExport;
    fetchAllocationDuhExport(date: string, screenUnitId: number, materialId?: string): Promise<AllocationDuhExportDto | null>;
    saveAllocations(saveAllocationsDTO: SaveAllocationsDTO, date: string, screenUnitId: number, username: string): Promise<{
        type: string;
        message: string;
    }>;
    downloadAllocations(date: string, screenUnitId: number, username: string, materialId?: string): Promise<{
        data: null;
        type: string;
        message: string;
    } | {
        data: {
            allocationDuhExport: AllocationDuhExportDto | null;
        };
        type: string;
        message: string;
    }>;
}
