export const formatDate = (date: Date) => {
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0˝')}`
    return { formattedDate, formattedTime, timestamp: date };
}

export const combineDateAndTime = (date: Date, time: string): Date => {
    const combinedDate = new Date(date);
    const [hours = "0", minutes = "0", seconds = "0"] = time.split(":");

    combinedDate.setHours(Number(hours), Number(minutes), Number(seconds), 0);

    return combinedDate;
};

export const getPreviousCalendarDate = (date: string): string => {
    const [year, month, day] = date.split("-").map((value) => Number(value));
    const parsed = year && month && day
        ? new Date(year, month - 1, day)
        : new Date(date);

    parsed.setDate(parsed.getDate() - 1);

    const parsedYear = parsed.getFullYear();
    const parsedMonth = `${parsed.getMonth() + 1}`.padStart(2, "0");
    const parsedDay = `${parsed.getDate()}`.padStart(2, "0");

    return `${parsedYear}-${parsedMonth}-${parsedDay}`;
};
