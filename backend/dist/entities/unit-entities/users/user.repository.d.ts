import { User } from "./user.model";
export declare class UserRepository {
    private readonly user;
    constructor(user: typeof User);
    fetchUnitUser(username: string): Promise<User | null>;
}
