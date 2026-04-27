import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { getModelToken } from "@nestjs/sequelize";
import { of, throwError } from "rxjs";
import { NotificationService } from "../../src/notifications/notification.service";
import { User } from "../../src/entities/unit-entities/users/user.model";

describe("NotificationService", () => {
    let service: NotificationService;
    let httpService: { post: jest.Mock };
    let configService: { get: jest.Mock };
    let userModel: { findAll: jest.Mock };

    const baseEnv: Record<string, string> = {
        NOTIFICATIONS_ENABLED: "true",
        NOTIFICATIONS_CHANNELS: "chat",
        SENDMAN_API_URL: "https://sendman.idf.cts/api",
        SENDMAN_API_TOKEN: "test-token",
        SENDMAN_CHAT_USERNAME: "chatuser",
        SENDMAN_CHAT_PASSWORD: "chatpass",
    };

    beforeEach(async () => {
        httpService = { post: jest.fn().mockReturnValue(of({ data: "ok" })) };
        configService = { get: jest.fn((key: string) => baseEnv[key]) };
        userModel = { findAll: jest.fn().mockResolvedValue([]) };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationService,
                { provide: HttpService, useValue: httpService },
                { provide: ConfigService, useValue: configService },
                { provide: getModelToken(User), useValue: userModel },
            ],
        }).compile();

        service = module.get(NotificationService);
    });

    describe("sendNotification", () => {
        it("should POST to Sendman with correct payload", async () => {
            await service.sendNotification({
                recipientUserIds: ["s1234567"],
                title: "Test",
                message: "Hello",
            });

            expect(httpService.post).toHaveBeenCalledWith(
                "https://sendman.idf.cts/api",
                {
                    channels: ["chat"],
                    recipients: ["s1234567"],
                    title: "Test",
                    message: "Hello",
                    chatOptions: { username: "chatuser", password: "chatpass" },
                },
                { headers: { "x-api-token": "test-token" } },
            );
        });

        it("should not call API when NOTIFICATIONS_ENABLED is false", async () => {
            configService.get.mockImplementation((key: string) =>
                key === "NOTIFICATIONS_ENABLED" ? "false" : baseEnv[key],
            );

            await service.sendNotification({
                recipientUserIds: ["s1234567"],
                title: "Test",
                message: "Hello",
            });

            expect(httpService.post).not.toHaveBeenCalled();
        });

        it("should not throw when API call fails", async () => {
            httpService.post.mockReturnValue(throwError(() => new Error("Network error")));

            await expect(
                service.sendNotification({
                    recipientUserIds: ["s1234567"],
                    title: "Test",
                    message: "Hello",
                }),
            ).resolves.toBeUndefined();
        });

        it("should skip when recipients list is empty", async () => {
            await service.sendNotification({
                recipientUserIds: [],
                title: "Test",
                message: "Hello",
            });

            expect(httpService.post).not.toHaveBeenCalled();
        });
    });

    describe("notifyUnitUsers", () => {
        it("should fetch users by unitId and send notification", async () => {
            userModel.findAll.mockResolvedValue([
                { id: "s1111111" },
                { id: "s2222222" },
            ]);

            await service.notifyUnitUsers(42, "Title", "Message");

            expect(userModel.findAll).toHaveBeenCalledWith({ where: { unitId: 42 } });
            expect(httpService.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    recipients: ["s1111111", "s2222222"],
                    title: "Title",
                    message: "Message",
                }),
                expect.any(Object),
            );
        });

        it("should not throw when user query fails", async () => {
            userModel.findAll.mockRejectedValue(new Error("DB down"));

            await expect(
                service.notifyUnitUsers(42, "Title", "Message"),
            ).resolves.toBeUndefined();
        });
    });
});
