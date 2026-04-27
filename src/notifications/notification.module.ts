import { Global, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "../entities/unit-entities/users/user.model";
import { NotificationService } from "./notification.service";

@Global()
@Module({
    imports: [
        HttpModule.register({ timeout: 10000 }),
        SequelizeModule.forFeature([User]),
    ],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule { }
