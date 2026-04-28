import { MaterialRepository } from "./material.repository";
import { PastedMaterialsDto } from "./material.types";
import { ReportCommentDto } from "src/entities/report-entities/report/report.types";
export declare class MaterialService {
    private readonly repository;
    constructor(repository: MaterialRepository);
    fetchExcelMaterials(): Promise<{
        id: string;
        description: string | null | undefined;
        unitOfMeasure: string | null | undefined;
        multiply: number | null | undefined;
        nickname: string | null | undefined;
        category: string | null | undefined;
        type: string;
    }[]>;
    fetchTwenty(filter: string, unitId: number, tab: number): Promise<({
        unitOfMeasure: string | null | undefined;
        multiply: number;
        category: string | null | undefined;
        nickname: string;
        type: string;
        favorite: boolean;
        comments: ReportCommentDto[];
        id: string;
        description?: string | null;
        centerId: number;
        sectionId: number;
        unitOfMeasurement?: string | null;
        recordStatus: string;
    } | Record<string, any>)[]>;
    fetchByIds(pastedMaterials: PastedMaterialsDto, screenUnitId: number, tab: number): Promise<(Record<string, any> | {
        unitOfMeasure: string | null | undefined;
        multiply: number;
        category: string | null | undefined;
        nickname: string;
        type: string;
        favorite: boolean;
        id: string;
        description?: string | null;
        centerId: number;
        sectionId: number;
        unitOfMeasurement?: string | null;
        recordStatus: string;
    })[]>;
}
