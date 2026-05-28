import { UNIT_STATUSES } from "../../../constants";
import { UnitStatusService } from "./units-statuses.service";

const buildService = () => {
    const repository = {
        fetchHierarchyUnitIds: jest.fn(),
        fetchNonGdudUnitIds: jest.fn(),
        deleteUsageInventoryReportsForUnitsDate: jest.fn(),
        clearStatusesForUnitsDate: jest.fn(),
        updateStatuses: jest.fn(),
    };

    const sequelize = {
        transaction: jest.fn(),
    };

    return {
        repository,
        service: new UnitStatusService(repository as any, sequelize as any),
        transaction: {} as any,
    };
};

describe("UnitStatusService", () => {
    it("deletes usage and inventory reports for non-gdud units when unlocking", async () => {
        const { repository, service, transaction } = buildService();
        repository.fetchHierarchyUnitIds.mockResolvedValue([10, 11, 12]);
        repository.fetchNonGdudUnitIds.mockResolvedValue([10, 11]);

        await service.updateHierarchyStatusesInTransaction({
            unitsIds: [10],
            statusId: UNIT_STATUSES.REQUESTING,
            updateHierarchy: true,
        }, "2026-04-23", transaction);

        expect(repository.fetchNonGdudUnitIds).toHaveBeenCalledWith(
            "2026-04-23",
            [10, 11, 12],
            transaction
        );
        expect(repository.deleteUsageInventoryReportsForUnitsDate).toHaveBeenCalledWith(
            [10, 11],
            "2026-04-23",
            transaction
        );
        expect(repository.updateStatuses).toHaveBeenCalledWith([
            { unitId: 10, unitStatusId: UNIT_STATUSES.REQUESTING, date: new Date("2026-04-23") },
            { unitId: 11, unitStatusId: UNIT_STATUSES.REQUESTING, date: new Date("2026-04-23") },
            { unitId: 12, unitStatusId: UNIT_STATUSES.REQUESTING, date: new Date("2026-04-23") },
        ], transaction);
    });

    it("does not delete reports when locking units", async () => {
        const { repository, service, transaction } = buildService();
        repository.fetchHierarchyUnitIds.mockResolvedValue([10]);

        await service.updateHierarchyStatusesInTransaction({
            unitsIds: [10],
            statusId: UNIT_STATUSES.WAITING_FOR_ALLOCATION,
            updateHierarchy: false,
        }, "2026-04-23", transaction);

        expect(repository.fetchNonGdudUnitIds).not.toHaveBeenCalled();
        expect(repository.deleteUsageInventoryReportsForUnitsDate).not.toHaveBeenCalled();
        expect(repository.updateStatuses).toHaveBeenCalledWith([
            { unitId: 10, unitStatusId: UNIT_STATUSES.WAITING_FOR_ALLOCATION, date: new Date("2026-04-23") },
        ], transaction);
    });
});
