import { Injectable } from "@nestjs/common";
import { formatDate } from "../utils/date";

@Injectable()
export class ServerTimeService {
    getCurrentServerTime() {
        const now = new Date();

        return {
            date: formatDate(now).formattedDate,
            timestamp: now.toISOString(),
        };
    }
}
