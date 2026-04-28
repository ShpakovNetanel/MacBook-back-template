import { Sequelize } from "sequelize-typescript";
import { UnitStatusRepository } from "./units-statuses.repository";
import { UpdateUnitStatus } from "./DTO/updateUnitStatus";
export declare class UnitStatusService {
    private readonly repository;
    private readonly sequelize;
    constructor(repository: UnitStatusRepository, sequelize: Sequelize);
    updateHierarchyStatuses(unitsStatuses: UpdateUnitStatus, date: string): Promise<number | undefined>;
}
