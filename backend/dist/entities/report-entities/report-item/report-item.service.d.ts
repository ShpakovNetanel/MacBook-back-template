import { ReportItemRepository } from "./report-item.repository";
import { Sequelize } from "sequelize-typescript";
import { EatAllocationDTO } from "./report.types";
import { UnitRepository } from "src/entities/unit-entities/unit/unit.repository";
import { UnitStatusRepository } from "src/entities/unit-entities/units-statuses/units-statuses.repository";
export declare class ReportItemService {
    private readonly repository;
    private readonly unitRepository;
    private readonly unitStatusRepository;
    private readonly sequelize;
    constructor(repository: ReportItemRepository, unitRepository: UnitRepository, unitStatusRepository: UnitStatusRepository, sequelize: Sequelize);
    eatAllocation(eatAllocation: EatAllocationDTO): Promise<{
        message: string;
        type: string;
    }>;
}
