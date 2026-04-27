import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "../entities/unit-entities/users/user.model";
import { NotificationParams, SendmanPayload } from "./notification.types";

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        @InjectModel(User) private readonly userModel: typeof User,
    ) { }

    async sendNotification(params: NotificationParams): Promise<void> {
        if (!this.isEnabled()) return;

        try {
            const { recipientUserIds, title, message } = params;

            if (recipientUserIds.length === 0) {
                this.logger.warn(`No recipients for notification: "${title}"`);
                return;
            }

            const channels = this.getChannels();
            if (channels.length === 0) return;

            const payload: SendmanPayload = {
                channels,
                recipients: recipientUserIds,
                message,
                title,
            };

            const chatUsername = this.configService.get<string>("SENDMAN_CHAT_USERNAME");
            const chatPassword = this.configService.get<string>("SENDMAN_CHAT_PASSWORD");
            if (channels.includes("chat") && chatUsername && chatPassword) {
                payload.chatOptions = { username: chatUsername, password: chatPassword };
            }

            const apiUrl = this.configService.get<string>("SENDMAN_API_URL");
            const apiToken = this.configService.get<string>("SENDMAN_API_TOKEN");

            await firstValueFrom(
                this.httpService.post(apiUrl!, payload, {
                    headers: { "x-api-token": apiToken },
                }),
            );

            this.logger.log(`Notification sent: "${title}" to ${recipientUserIds.length} recipient(s)`);
        } catch (error) {
            this.logger.error(
                `Failed to send notification: "${params.title}"`,
                error instanceof Error ? error.stack : String(error),
            );
        }
    }

    async notifyUnitUsers(unitId: number, title: string, message: string): Promise<void> {
        if (!this.isEnabled()) return;

        try {
            const users = await this.userModel.findAll({ where: { unitId } });
            const recipientUserIds = users.map(u => u.id);

            // TODO: TEMPORARY DEBUG LOGGING — remove before production
            if (recipientUserIds.length === 0) {
                console.log(`[NOTIFICATION DEBUG] No users found for unit ${unitId}. Would have sent: title="${title}", message="${message}"`);
            } else {
                console.log(`[NOTIFICATION DEBUG] Unit ${unitId} → recipients: [${recipientUserIds.join(', ')}], title="${title}", message="${message}"`);
            }

            await this.sendNotification({ recipientUserIds, title, message });
        } catch (error) {
            this.logger.error(
                `Failed to fetch users for unit ${unitId}`,
                error instanceof Error ? error.stack : String(error),
            );
        }
    }

    private isEnabled(): boolean {
        return this.configService.get<string>("NOTIFICATIONS_ENABLED") === "true";
    }

    private getChannels(): string[] {
        const raw = this.configService.get<string>("NOTIFICATIONS_CHANNELS") ?? "";
        return raw.split(",").map(c => c.trim()).filter(Boolean);
    }
}
