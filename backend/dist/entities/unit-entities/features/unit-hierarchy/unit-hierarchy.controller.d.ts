import { UnitHierarchyService } from "./unit-hierarchy.service";
import type { Request } from "express";
import { RemoveUnitRelationDto } from "./DTO/remove-unit-relation.dto";
import { AddUnitRelationDto } from "./DTO/add-unit-relation.dto";
import { TransferUnitRelationDto } from "./DTO/update-unit-relation.dto";
export declare class UnitHierarchyController {
    private readonly service;
    constructor(service: UnitHierarchyService);
    getAllUnits(request: Request): Promise<import("./unit-hierarchy.types").UnitHierarchyNode[]>;
    getHierarchy(request: Request): Promise<import("./unit-hierarchy.types").UnitHierarchyNode[]>;
    addUnitRelation(addUnitRelationDto: AddUnitRelationDto, request: Request): Promise<{
        message: string;
        type: string;
    }>;
    removeUnitRelation(removeUnitRelationDto: RemoveUnitRelationDto, request: Request): Promise<{
        message: string;
        type: string;
    }>;
    transferUnitRelation(transferUnitRelationDto: TransferUnitRelationDto, request: Request): Promise<{
        message: string;
        type: string;
    }>;
}
