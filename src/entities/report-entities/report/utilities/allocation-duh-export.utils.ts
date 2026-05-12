import type { AllocationDuhExportRowDto } from "../report.types";

const buildAllocationDuhRowKey = (row: AllocationDuhExportRowDto) => [
    row.unitLevelId,
    row.unitSimul,
    row.materialId,
].join(":");

export const aggregateAllocationDuhRows = (
    rows: AllocationDuhExportRowDto[]
): AllocationDuhExportRowDto[] => {
    const rowsByKey = new Map<string, AllocationDuhExportRowDto>();

    for (const row of rows) {
        const key = buildAllocationDuhRowKey(row);
        const existingRow = rowsByKey.get(key);

        if (!existingRow) {
            rowsByKey.set(key, { ...row });
            continue;
        }

        existingRow.quantity += row.quantity;
    }

    return Array.from(rowsByKey.values());
};
