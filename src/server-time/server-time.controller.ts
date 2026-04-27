import { Controller, Get } from "@nestjs/common";
import { ServerTimeService } from "./server-time.service";

@Controller("server-time")
export class ServerTimeController {
    constructor(private readonly serverTimeService: ServerTimeService) { }

    @Get()
    getServerTime() {
        return this.serverTimeService.getCurrentServerTime();
    }
}
