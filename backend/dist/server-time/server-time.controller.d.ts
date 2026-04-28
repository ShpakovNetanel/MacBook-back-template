import { ServerTimeService } from "./server-time.service";
export declare class ServerTimeController {
    private readonly serverTimeService;
    constructor(serverTimeService: ServerTimeService);
    getServerTime(): {
        date: string;
        timestamp: string;
    };
}
