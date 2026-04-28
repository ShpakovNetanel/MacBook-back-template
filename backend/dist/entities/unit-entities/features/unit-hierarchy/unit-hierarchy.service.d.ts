import { Sequelize } from "sequelize-typescript";
import { UnitHierarchyRepository } from "./unit-hierarchy.repository";
import { UnitHierarchyNode } from "./unit-hierarchy.types";
import { UnitRelation } from "../../unit-relations/unit-relation.model";
import { RemoveUnitRelationDto } from "./DTO/remove-unit-relation.dto";
import { AddUnitRelationDto } from "./DTO/add-unit-relation.dto";
import { TransferUnitRelationDto } from "./DTO/update-unit-relation.dto";
import { UnitStatusRepository } from "../../units-statuses/units-statuses.repository";
import { ReportRoutingRepository } from "../../../report-entities/report/report-routing.repository";
import { UserRepository } from "../../users/user.repository";
export declare class UnitHierarchyService {
    private readonly repository;
    private readonly sequelize;
    private readonly unitStatusTypesRepository;
    private readonly reportRoutingRepository;
    private readonly unitUserRepository;
    private readonly logger;
    constructor(repository: UnitHierarchyRepository, sequelize: Sequelize, unitStatusTypesRepository: UnitStatusRepository, reportRoutingRepository: ReportRoutingRepository, unitUserRepository: UserRepository);
    getHierarchyForUser(username: string, date: string): Promise<UnitHierarchyNode[]>;
    getAllUnitsWithParents(date: string): Promise<UnitHierarchyNode[]>;
    removeUnitRelation(removeUnitRelationDto: RemoveUnitRelationDto, date: string): Promise<{
        message: string;
        type: string;
    }>;
    addUnitRelation(addUnitRelationDto: AddUnitRelationDto, date: string, username: string): Promise<{
        message: string;
        type: string;
    }>;
    transferUnitRelation(transferUnitRelationDto: TransferUnitRelationDto, date: string, username: string): Promise<{
        message: string;
        type: string;
    }>;
    fetchLowerUnits(date: string, unitId: number): Promise<UnitRelation[]>;
    fetchActiveRelations(date: string): Promise<UnitRelation[]>;
    buildEmergencyUnitLookup(relations: UnitRelation[]): Record<number, boolean>;
}
