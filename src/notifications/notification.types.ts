export type SendmanPayload = {
    channels: string[];
    recipients: string[];
    message: string;
    title: string;
    chatOptions?: {
        username: string;
        password: string;
    };
};

export type NotificationParams = {
    recipientUserIds: string[];
    title: string;
    message: string;
};
