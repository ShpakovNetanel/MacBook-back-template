import { REPORT_TYPES } from "../../../../../src/constants";
import { buildReportsResponse } from "../../../../../src/entities/report-entities/report/utilities/report-fetch.utils";

const buildComment = (
    unitId: number,
    recipientUnitId: number,
    text: string
) => ({
    dataValues: {
        unitId,
        recipientUnitId,
        text,
    },
});

const buildUnitAssociation = (id: number, description: string) => ({
    details: [{
        unitId: id,
        description,
        unitLevelId: 1,
        tsavIrgunCodeId: String(id),
    }],
    unitStatus: [{
        unitStatus: {
            id: 1,
            description: "בדיווח",
        },
    }],
});

describe("buildReportsResponse", () => {
    it("excludes the screen unit from items and returns its comment in comments", () => {
        const data = buildReportsResponse({
            recipientUnitId: 35,
            reports: [{
                unitId: 35,
                recipientUnitId: 35,
                reportTypeId: REPORT_TYPES.USAGE,
                unit: buildUnitAssociation(35, "Unit 35"),
                recipientUnit: buildUnitAssociation(35, "Unit 35"),
                items: [{
                    materialId: "M0000001",
                    confirmedQuantity: 2,
                    status: "ACTIVE",
                    material: {
                        id: "M0000001",
                        comments: [
                            buildComment(35, 35, "screen unit comment"),
                        ],
                    },
                }],
            }] as any,
        });

        expect(data).toEqual([{
            material: {
                id: "M0000001",
                description: "",
                multiply: 0,
                nickname: "",
                category: "",
                unitOfMeasure: "יח",
                type: "ITEM",
            },
            comments: [{
                type: REPORT_TYPES.USAGE,
                comment: "screen unit comment",
            }],
            receivedAllocationQuantity: null,
            quantityLeftToAllocate: null,
            items: [],
        }]);
    });

    it("keeps child unit rows in items", () => {
        const data = buildReportsResponse({
            recipientUnitId: 35,
            reports: [{
                unitId: 100,
                recipientUnitId: 35,
                reportTypeId: REPORT_TYPES.USAGE,
                unit: buildUnitAssociation(100, "Unit 100"),
                recipientUnit: buildUnitAssociation(35, "Unit 35"),
                items: [{
                    materialId: "M0000001",
                    confirmedQuantity: 2,
                    status: "ACTIVE",
                    material: {
                        id: "M0000001",
                        comments: [
                            buildComment(100, 35, "child comment"),
                        ],
                    },
                }],
            }] as any,
        });

        expect(data).toHaveLength(1);
        expect(data[0].comments).toEqual([]);
        expect(data[0].items).toHaveLength(1);
        expect(data[0].items[0].unit.id).toBe(100);
        expect(data[0].items[0].types[0].comment).toBe("child comment");
        expect(data[0].quantityLeftToAllocate).toBeNull();
        expect(data[0].items[0].allocatedQuantity).toBeNull();
    });

    it("puts allocation quantity on the report item and not inside the type", () => {
        const data = buildReportsResponse({
            recipientUnitId: 35,
            reports: [{
                unitId: 35,
                recipientUnitId: 100,
                reportTypeId: REPORT_TYPES.ALLOCATION,
                unit: buildUnitAssociation(35, "Unit 35"),
                recipientUnit: buildUnitAssociation(100, "Unit 100"),
                items: [{
                    materialId: "M0000001",
                    reportedQuantity: 7,
                    confirmedQuantity: 10,
                    balanceQuantity: 4,
                    status: "ACTIVE",
                    material: {
                        id: "M0000001",
                        comments: [],
                    },
                }],
            }] as any,
        });

        expect(data).toHaveLength(1);
        expect(data[0].items[0].allocatedQuantity).toBe(10);
        expect(data[0].items[0].types[0]).toEqual(expect.objectContaining({
            id: REPORT_TYPES.ALLOCATION,
            quantity: 7,
        }));
        expect(data[0].items[0].types[0]).not.toHaveProperty("allocatedQuantity");
    });

    it("keeps allocation type quantity on reported quantity after reporting resets the draft", () => {
        const data = buildReportsResponse({
            recipientUnitId: 35,
            reports: [{
                unitId: 35,
                recipientUnitId: 100,
                reportTypeId: REPORT_TYPES.ALLOCATION,
                unit: buildUnitAssociation(35, "Unit 35"),
                recipientUnit: buildUnitAssociation(100, "Unit 100"),
                items: [{
                    materialId: "M0000001",
                    reportedQuantity: 0,
                    confirmedQuantity: 10,
                    balanceQuantity: 10,
                    status: "ACTIVE",
                    material: {
                        id: "M0000001",
                        comments: [],
                    },
                }],
            }] as any,
        });

        expect(data[0].items[0].allocatedQuantity).toBe(10);
        expect(data[0].items[0].types[0].quantity).toBe(0);
    });

    it("returns incoming allocation balance as quantity left to allocate", () => {
        const data = buildReportsResponse({
            recipientUnitId: 35,
            reports: [],
            screenAllocationReports: [{
                unitId: 1,
                recipientUnitId: 35,
                reportTypeId: REPORT_TYPES.ALLOCATION,
                items: [{
                    materialId: "M0000001",
                    balanceQuantity: 12,
                    confirmedQuantity: 15,
                    status: "ACTIVE",
                    material: {
                        id: "M0000001",
                        comments: [],
                    },
                }],
            }] as any,
        });

        expect(data).toEqual([{
            material: {
                id: "M0000001",
                description: "",
                multiply: 0,
                nickname: "",
                category: "",
                unitOfMeasure: "יח",
                type: "ITEM",
            },
            comments: [],
            receivedAllocationQuantity: 15,
            quantityLeftToAllocate: 12,
            items: [],
        }]);
    });

    it("builds standard group metadata when the report item points to a standard group", () => {
        const data = buildReportsResponse({
            recipientUnitId: 35,
            reports: [{
                unitId: 100,
                recipientUnitId: 35,
                reportTypeId: REPORT_TYPES.USAGE,
                unit: buildUnitAssociation(100, "Unit 100"),
                recipientUnit: buildUnitAssociation(35, "Unit 35"),
                items: [{
                    materialId: "GRP000001",
                    confirmedQuantity: 2,
                    status: "ACTIVE",
                    standardGroup: {
                        id: "GRP000001",
                        name: "Tool Group",
                        groupType: "TOOL",
                        nickname: {
                            nickname: "Group Nickname",
                        },
                        categoryGroup: {
                            categoryDesc: {
                                description: "קטגוריית כלים",
                            },
                        },
                    },
                }],
            }] as any,
        });

        expect(data).toHaveLength(1);
        expect(data[0].material).toEqual({
            id: "GRP000001",
            description: "Tool Group",
            multiply: 0,
            nickname: "Group Nickname",
            category: "קטגוריית כלים",
            unitOfMeasure: "יח",
            type: "TOOL",
        });
    });
});
