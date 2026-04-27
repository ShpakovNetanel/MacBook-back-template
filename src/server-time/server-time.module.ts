import { Module } from "@nestjs/common";
import { ServerTimeController } from "./server-time.controller";
import { ServerTimeService } from "./server-time.service";

@Module({
    controllers: [ServerTimeController],
    providers: [ServerTimeService],
})
export class ServerTimeModule { }
