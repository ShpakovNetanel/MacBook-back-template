import { ReportRepository } from "src/entities/report-entities/report/report.repository";
import { UnitHierarchyService } from "src/entities/unit-entities/features/unit-hierarchy/unit-hierarchy.service";
import { StandardResponse } from "./standard.types";
import { StandardRepository } from "./standard.repository";
export declare class StandardService {
    private readonly standardRepository;
    private readonly reportRepository;
    private readonly unitHierarchyService;
    constructor(standardRepository: StandardRepository, reportRepository: ReportRepository, unitHierarchyService: UnitHierarchyService);
    getRelevantToolMaterialIds(screenUnitId: number, date: string): Promise<string[]>;
    getStandards(screenUnitId: number, date: string): Promise<StandardResponse>;
}
