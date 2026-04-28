import { MaterialService } from "./material.service";
import { PastedMaterialsDto } from "./material.types";
export declare class MaterialController {
    private readonly service;
    constructor(service: MaterialService);
    fetchExcelMaterials(): Promise<{
        id: string;
        description: string | null | undefined;
        unitOfMeasure: string | null | undefined;
        multiply: number | null | undefined;
        nickname: string | null | undefined;
        category: string | null | undefined;
        type: string;
    }[]>;
    fetchTwenty(filter: string, request: Request, tab: number): Promise<(Record<string, any> | {
        unitOfMeasure: string | null | undefined;
        multiply: number;
        category: string | null | undefined;
        nickname: string;
        type: string;
        favorite: boolean;
        comments: import("../../report-entities/report/report.types").ReportCommentDto[];
        id: string;
        description?: string | null;
        centerId: number;
        sectionId: number;
        unitOfMeasurement?: string | null;
        recordStatus: string;
    })[]>;
    pastedMaterials(pastedMaterials: PastedMaterialsDto, request: Request, tab: number): Promise<(Record<string, any> | {
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
