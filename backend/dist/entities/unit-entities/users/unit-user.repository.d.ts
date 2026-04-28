import { UnitUser } from "./unit-user.model";
export declare class UnitUserRepository {
    private readonly unitUser;
    constructor(unitUser: typeof UnitUser);
    fetchUnitUser(username: string, date: string): Promise<UnitUser | null>;
}
