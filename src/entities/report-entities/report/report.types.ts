export type SaveReports = {
    changes: {
        materialId: string,
        type: number,
        unitId: number,
        quantity: number
    }[],
    children: number[]
}

