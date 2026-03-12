import { BadGatewayException, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { isEmpty } from "remeda";
import { col, Op, where } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { RECORD_STATUS, REPORT_TYPES, UNIT_RELATION_TYPES, UNIT_STATUSES } from "src/contants";
import { MainCategory } from "src/entities/material-entities/categories/categories.model";
import { MaterialCategory } from "src/entities/material-entities/material-category/material-category.model";
import { MaterialNickname } from "src/entities/material-entities/material-nickname/material-nickname.model";
import { Material } from "src/entities/material-entities/material/material.model";
import { UnitFavoriteMaterial } from "src/entities/material-entities/unit-favorite-material/unit-favorite-material.model";
import { UnitId } from "src/entities/unit-entities/unit-id/unit-id.model";
import { UnitRelation } from "src/entities/unit-entities/unit-relations/unit-relation.model";
import { UnitStatus } from "src/entities/unit-entities/units-statuses/units-statuses.model";
import { IReportItem, ReportItem } from "../report-item/report-item.model";
import { IReport, Report } from "./report.model";
import { ReportChanges } from "./report.types";

@Injectable()
export class ReportRepository {
    private readonly logger = new Logger(ReportRepository.name);

    constructor(@InjectModel(Report) private readonly reportModel: typeof Report,
        @InjectModel(ReportItem) private readonly reportItemModel: typeof ReportItem,
        @InjectModel(UnitFavoriteMaterial) private readonly unitFavoriteMaterialModel: typeof UnitFavoriteMaterial,
        @InjectModel(UnitRelation) private readonly unitRelationModel: typeof UnitRelation,
        @InjectModel(Material) private readonly materialModel: typeof Material) { }

    async saveReports({ reportsToSave, transaction, skipEmptyItems = true }: ReportChanges): Promise<void> {
        try {
            for (const reportToSave of reportsToSave) {
                if (isEmpty(reportToSave.items) && skipEmptyItems) continue;

                const modifiedReport = await this.reportModel.upsert(reportToSave.header, {
                    conflictFields: ['created_on', 'recipient_unit_id', 'unit_id', 'report_type_id'] as unknown as (keyof IReport)[],
                    transaction
                })

                const itemsToModify = reportToSave.items.map(item => ({
                    ...item,
                    reportId: modifiedReport[0].dataValues.id
                }) as IReportItem)

                if (!isEmpty(reportToSave.items)) {
                    await this.reportItemModel.bulkCreate(itemsToModify, {
                        updateOnDuplicate: ['modifiedAt', 'changedAt', 'changedBy',
                            'confirmedQuantity', 'status'],
                        transaction
                    })
                }
            }
        } catch (error) {
            this.logger.error("Failed to save reports", error instanceof Error ? error.stack : String(error));

            throw new BadGatewayException({
                message: 'נכשלה פעולת השמירה, יש לנסות שוב',
                type: 'Failure'
            })
        }
    }

    async fetchParentUnits(date: Date, childUnitIds: number[]): Promise<Map<number, number>> {
        if (childUnitIds.length === 0) return new Map<number, number>();

        const relations = await this.unitRelationModel.findAll({
            attributes: ["unitId", "relatedUnitId"],
            where: {
                unitRelationId: UNIT_RELATION_TYPES.ZRA,
                relatedUnitId: { [Op.in]: childUnitIds },
                startDate: { [Op.lte]: date },
                endDate: { [Op.gt]: date }
            }
        });

        const parentByChild = new Map<number, number>();
        for (const relation of relations) {
            if (!parentByChild.has(relation.relatedUnitId)) {
                parentByChild.set(relation.relatedUnitId, relation.unitId);
            }
        }

        return parentByChild;
    }

    async fetchDescendantUnits(
        date: Date,
        rootUnitId: number
    ): Promise<{ descendantIds: number[]; parentByChild: Map<number, number> }> {
        const visited = new Set<number>([rootUnitId]);
        const parentByChild = new Map<number, number>();
        const descendantIds: number[] = [];

        let units = [rootUnitId];
        while (units.length > 0) {
            const relations = await this.unitRelationModel.findAll({
                attributes: ["unitId", "relatedUnitId"],
                include: [{
                    model: UnitId,
                    as: "relatedUnit",
                    required: true,
                    include: [{
                        model: UnitStatus,
                        required: true,
                        where: {
                            unitStatusId: { [Op.ne]: UNIT_STATUSES.REQUESTING },
                        },
                    }]
                }],
                where: {
                    unitRelationId: UNIT_RELATION_TYPES.ZRA,
                    unitId: { [Op.in]: units },
                    startDate: { [Op.lte]: date },
                    endDate: { [Op.gt]: date }
                },
            });
            const next: number[] = [];

            for (const relation of relations) {
                const childId = relation.relatedUnitId;

                if (!visited.has(childId)) {
                    visited.add(childId);
                    parentByChild.set(childId, relation.unitId);
                    descendantIds.push(childId);
                    next.push(childId);
                }
            }

            units = next;
        }

        return { descendantIds, parentByChild };
    }

    async fetchReportsByTypeAndUnitsForMaterials(
        date: string,
        reportType: number,
        materials: string[] | undefined = [],
        units: number[]
    ) {
        return this.reportModel.findAll({
            include: [{
                association: 'items',
                where: {
                    materialId: { [Op.in]: materials }
                }
            }],
            where: {
                reportTypeId: reportType,
                createdOn: new Date(date),
                unitId: { [Op.in]: units }
            }
        })
    }

    async fetchActiveReportItemQuantitiesByUnitAndMaterial(
        date: string,
        reportType: number,
        materialIds: string[],
        unitIds: number[]
    ): Promise<Array<{ unitId: number; materialId: string; quantity: number }>> {
        if (materialIds.length === 0 || unitIds.length === 0) return [];

        const reports = await this.reportModel.findAll({
            attributes: ["unitId"],
            where: {
                reportTypeId: reportType,
                createdOn: new Date(date),
                unitId: { [Op.in]: unitIds },
            },
            include: [{
                association: "items",
                required: true,
                attributes: ["materialId", "confirmedQuantity", "reportedQuantity"],
                where: {
                    materialId: { [Op.in]: materialIds },
                    status: RECORD_STATUS.ACTIVE,
                },
            }],
        });

        const quantityByUnitMaterial = new Map<string, number>();
        for (const report of reports) {
            for (const item of report.items ?? []) {
                const quantity = Number(item.confirmedQuantity ?? item.reportedQuantity ?? 0);
                const safeQuantity = Number.isNaN(quantity) ? 0 : quantity;
                const key = `${report.unitId}:${item.materialId}`;
                quantityByUnitMaterial.set(
                    key,
                    (quantityByUnitMaterial.get(key) ?? 0) + safeQuantity
                );
            }
        }

        return Array.from(quantityByUnitMaterial.entries()).map(([key, quantity]) => {
            const [unitIdAsString, materialId] = key.split(":");

            return {
                unitId: Number(unitIdAsString),
                materialId,
                quantity,
            };
        });
    }

    async fetchReportsData(
        date: string,
        recipientUnitId: number,
        material: string | undefined = ''
    ): Promise<Report[]> {
        const { descendantIds, unitIds } = await this.buildReportScope(date, recipientUnitId);
        return this.fetchReportsByScope({
            date,
            descendantIds,
            unitIds,
            material,
            itemStatuses: [RECORD_STATUS.ACTIVE, RECORD_STATUS.INACTIVE]
        });
    }

    async fetchFavoriteReportsData(
        date: string,
        recipientUnitId: number
    ): Promise<Report[]> {
        const favorites = await this.unitFavoriteMaterialModel.findAll({
            attributes: ["materialId"],
            where: { unitId: recipientUnitId }
        });
        const favoriteMaterialIds = Array.from(new Set(favorites.map((favorite) => favorite.materialId)));
        if (favoriteMaterialIds.length === 0) return [];

        const { descendantIds, unitIds } = await this.buildReportScope(date, recipientUnitId);
        return this.fetchReportsByScope({
            date,
            descendantIds,
            unitIds,
            itemStatuses: [RECORD_STATUS.ACTIVE, RECORD_STATUS.INACTIVE],
            materialIds: favoriteMaterialIds
        });
    }

    async fetchFavoriteMaterials(recipientUnitId: number): Promise<Material[]> {
        return this.materialModel.findAll({
            where: {
                recordStatus: RECORD_STATUS.ACTIVE
            },
            include: [{
                association: "nickname",
                required: false,
            }, {
                association: "materialCategory",
                required: false,
                include: [{
                    association: "mainCategory",
                    required: false,
                }],
            }, {
                association: "unitFavorites",
                required: true,
                where: {
                    unitId: recipientUnitId
                }
            }],
        });
    }

    async fetchMostRecentReportsData(
        date: string,
        recipientUnitId: number
    ): Promise<Report[]> {
        const { descendantIds, unitIds } = await this.buildReportScope(date, recipientUnitId);
        if (descendantIds.length === 0) return [];

        const latestCreatedOn = await this.reportModel.max("createdOn", {
            where: {
                unitId: { [Op.in]: descendantIds },
                recipientUnitId: { [Op.in]: unitIds },
                createdOn: { [Op.lte]: date },
                reportTypeId: { [Op.in]: [REPORT_TYPES.REQUEST, REPORT_TYPES.INVENTORY, REPORT_TYPES.USAGE] }
            }
        });

        const latestDate = this.toDateOnly(latestCreatedOn);
        if (!latestDate) return [];

        return this.fetchReportsByScope({
            date: latestDate,
            descendantIds,
            unitIds,
            itemStatuses: [RECORD_STATUS.ACTIVE, RECORD_STATUS.INACTIVE]
        });
    }

    async fetchReportsDataForUnits(
        date: string,
        unitIds: number[],
    ): Promise<Report[]> {
        if (unitIds.length === 0) return [];

        return this.reportModel.findAll({
            where: {
                unitId: { [Op.in]: unitIds },
                recipientUnitId: { [Op.in]: unitIds },
                createdOn: date,
                reportTypeId: { [Op.in]: [REPORT_TYPES.REQUEST, REPORT_TYPES.INVENTORY, REPORT_TYPES.USAGE] },
            },
            include: this.buildReportsInclude(date),
        });
    }

    async buildReportScope(date: string, recipientUnitId: number) {
        const { descendantIds } = await this.fetchDescendantUnits(new Date(date), recipientUnitId);
        return {
            descendantIds,
            unitIds: [recipientUnitId, ...descendantIds]
        };
    }

    private fetchReportsByScope({
        date,
        descendantIds,
        unitIds,
        material = '',
        itemStatuses = [RECORD_STATUS.ACTIVE],
        materialIds
    }: {
        date: string;
        descendantIds: number[];
        unitIds: number[];
        material?: string;
        itemStatuses?: string[];
        materialIds?: string[];
    }): Promise<Report[]> {
        if (descendantIds.length === 0) return Promise.resolve([]);

        return this.reportModel.findAll({
            where: {
                unitId: { [Op.in]: descendantIds },
                recipientUnitId: { [Op.in]: unitIds },
                createdOn: date,
                reportTypeId: { [Op.in]: [REPORT_TYPES.REQUEST, REPORT_TYPES.INVENTORY, REPORT_TYPES.USAGE] }
            },
            include: this.buildReportsInclude(
                date,
                material,
                itemStatuses,
                materialIds
            ),
        });
    }

    private toDateOnly(value: unknown): string | null {
        if (!value) return null;
        if (value instanceof Date) {
            const year = value.getFullYear();
            const month = `${value.getMonth() + 1}`.padStart(2, "0");
            const day = `${value.getDate()}`.padStart(2, "0");
            return `${year}-${month}-${day}`;
        }

        const dateAsString = String(value);
        if (dateAsString.length < 10) return null;
        return dateAsString.slice(0, 10);
    }

    private buildReportsInclude(
        date: string,
        material: string | undefined = '',
        itemStatuses: string[] = [RECORD_STATUS.ACTIVE],
        materialIds: string[] = []
    ) {
        const materialFilter = materialIds.length > 0
            ? { [Op.in]: materialIds }
            : { [Op.iLike]: `%${material}%` };

        return [{
            association: "unit",
            required: false,
            include: [{
                association: "details",
                required: false,
                attributes: ["unitId", "description", "unitLevelId", "startDate", "tsavIrgunCodeId"],
                where: {
                    startDate: { [Op.lte]: date },
                    endDate: { [Op.gt]: date }
                }
            }, {
                association: "unitStatus",
                required: false,
                attributes: ["unitStatusId", "date"],
                where: {
                    date,
                },
                include: [{
                    association: "unitStatus",
                    attributes: ["id", "description"],
                }],
            }]
        }, {
            association: "recipientUnit",
            required: false,
            include: [{
                association: "details",
                required: false,
                attributes: ["unitId", "description", "unitLevelId", "startDate", "tsavIrgunCodeId"],
                where: {
                    startDate: { [Op.lte]: date },
                    endDate: { [Op.gt]: date }
                }
            }, {
                association: "unitStatus",
                required: false,
                attributes: ["unitStatusId", "date"],
                where: {
                    date,
                },
                include: [{
                    association: "unitStatus",
                    attributes: ["id", "description"],
                }],
            }]
        }, {
            attributes: ['reportedQuantity', 'confirmedQuantity', 'status', 'materialId'],
            model: ReportItem,
            as: "items",
            include: [{
                model: Material,
                as: "material",
                required: false,
                include: [{
                    association: "comments",
                    required: false,
                    on: {
                        [Op.and]: [
                            where(col("items->material->comments.type"), Op.eq, col("Report.report_type_id")),
                            where(col("items->material->comments.material_id"), Op.eq, col("items.material_id")),
                            where(col("items->material->comments.date"), Op.eq, col("Report.created_on")),
                            {
                                [Op.or]: [
                                    where(col("items->material->comments.unit_id"), Op.eq, col("Report.unit_id")),
                                    where(col("items->material->comments.unit_id"), Op.eq, col("Report.recipient_unit_id")),
                                ]
                            }
                        ]
                    }
                }, {
                    model: MaterialNickname,
                    as: "nickname",
                    required: false,
                }, {
                    model: MaterialCategory,
                    as: "materialCategory",
                    required: false,
                    include: [{
                        model: MainCategory,
                        as: "mainCategory",
                        required: false,
                    }],
                }],
            }],
            where: {
                materialId: materialFilter,
                modifiedAt: {
                    [Op.eq]: Sequelize.literal(`(SELECT MAX("report_items"."modified_at")
                                              FROM "report_items"
                                             WHERE "report_items"."report_id" = "Report"."id"
                                               AND "report_items"."material_id" = "items"."material_id" )`)
                },
                status: { [Op.in]: itemStatuses }
            }
        }];
    }
}
