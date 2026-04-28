import { IUnit, Unit } from "./unit.model";
export type ActiveUnitDetails = Pick<IUnit, "unitId" | "unitLevelId" | "startDate">;
export declare class UnitRepository {
    private readonly unitModel;
    constructor(unitModel: typeof Unit);
    fetchActiveUnitDetails(date: string | Date, unitId: number): Promise<ActiveUnitDetails | null>;
}
