import { aggregateAllocationDuhRows } from "../../../../../src/entities/report-entities/report/utilities/allocation-duh-export.utils";

describe("allocation-duh-export utils", () => {
    it("sums a converted material group row with an existing material row for the same unit", () => {
        const rows = aggregateAllocationDuhRows([{
            materialId: "100001",
            materialDescription: "מק״ט אחרי המרה",
            quantity: 5,
            unitOfMeasure: "יח'",
            unitLevelId: 1,
            unitSimul: "10",
            unitDescription: "יחידה א",
        }, {
            materialId: "100001",
            materialDescription: "מק״ט אחרי המרה",
            quantity: 7,
            unitOfMeasure: "יח'",
            unitLevelId: 1,
            unitSimul: "10",
            unitDescription: "יחידה א",
        }]);

        expect(rows).toEqual([{
            materialId: "100001",
            materialDescription: "מק״ט אחרי המרה",
            quantity: 12,
            unitOfMeasure: "יח'",
            unitLevelId: 1,
            unitSimul: "10",
            unitDescription: "יחידה א",
        }]);
    });

    it("does not sum the same material across different units", () => {
        const rows = aggregateAllocationDuhRows([{
            materialId: "100001",
            materialDescription: "מק״ט",
            quantity: 5,
            unitOfMeasure: "יח'",
            unitLevelId: 1,
            unitSimul: "10",
            unitDescription: "יחידה א",
        }, {
            materialId: "100001",
            materialDescription: "מק״ט",
            quantity: 7,
            unitOfMeasure: "יח'",
            unitLevelId: 1,
            unitSimul: "11",
            unitDescription: "יחידה ב",
        }]);

        expect(rows).toHaveLength(2);
        expect(rows.map((row) => row.quantity)).toEqual([5, 7]);
    });
});
