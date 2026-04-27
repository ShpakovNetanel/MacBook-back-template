import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./user.model";

@Injectable()
export class UserRepository {
    constructor(@InjectModel(User) private readonly user: typeof User) { }

    fetchUnitUser(username: string) {
        return this.user.findOne({
            where: {
                id: username,
            }
        })
    }
}