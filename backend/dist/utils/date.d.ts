export declare const formatDate: (date: Date) => {
    formattedDate: string;
    formattedTime: string;
    timestamp: Date;
};
export declare const combineDateAndTime: (date: Date, time: string) => Date;
export declare const getPreviousCalendarDate: (date: string) => string;
