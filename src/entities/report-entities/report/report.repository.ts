import { BadGatewayException, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { isEmpty } from "remeda";
import { col, Op, where } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { RECORD_STATUS, REPORT_TYPES, UNIT_RELATION_TYPES } from "src/contants";
import { MainCategory } from "src/entities/material-entities/categories/categories.model";
import { MaterialCategory } from "src/entities/material-entities/material-category/material-category.model";
import { MaterialNickname } from "src/entities/material-entities/material-nickname/material-nickname.model";
import { Material } from "src/entities/material-entities/material/material.model";
import { UnitRelation } from "src/entities/unit-entities/unit-relations/unit-relation.model";
import { IReportItem, ReportItem } from "../report-item/report-item.model";
import { Stock } from "../stock/stock.model";
import { IReport, Report } from "./report.model";
import { ReportChanges } from "./report.types";

@Injectable()
export class ReportRepository {
    private readonly logger = new Logger(ReportRepository.name);

    constructor(@InjectModel(Report) private readonly reportModel: typeof Report,
        @InjectModel(ReportItem) private readonly reportItemModel: typeof ReportItem,
        @InjectModel(UnitRelation) private readonly unitRelationModel: typeof UnitRelation,
        @InjectModel(Stock) private readonly stockModel: typeof Stock) { }

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

    upsertReports(reportChanges: ReportChanges): Promise<void> {
        return this.saveReports(reportChanges);
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
                where: {
                    unitRelationId: UNIT_RELATION_TYPES.ZRA,
                    unitId: { [Op.in]: units },
                    startDate: { [Op.lte]: date },
                    endDate: { [Op.gt]: date }
                }
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

    async fetchReportsData(
        date: string,
        recipientUnitId: number,
        material: string | undefined = ''
    ): Promise<Report[]> {
        const { descendantIds } = await this.fetchDescendantUnits(new Date(date), recipientUnitId);
        const unitIds = [recipientUnitId, ...descendantIds];

        return this.reportModel.findAll({
            where: {
                unitId: { [Op.in]: descendantIds },
                recipientUnitId: { [Op.in]: unitIds },
                createdOn: date,
                reportTypeId: { [Op.in]: [REPORT_TYPES.REQUEST, REPORT_TYPES.INVENTORY, REPORT_TYPES.USAGE] }
            },
            include: this.buildReportsInclude(date, material),
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

    private buildReportsInclude(date: string, material: string | undefined = '') {
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
                                    {
                                        [Op.and]: [
                                            where(col("items->material->comments.unit_id"), Op.eq, col("Report.unit_id")),
                                            where(col("items->material->comments.recipient_unit_id"), Op.eq, col("Report.recipient_unit_id")),
                                        ],
                                    },
                                    {
                                        [Op.and]: [
                                            where(col("items->material->comments.unit_id"), Op.eq, col("Report.recipient_unit_id")),
                                            where(col("items->material->comments.recipient_unit_id"), Op.eq, col("Report.unit_id")),
                                        ],
                                    }
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
                materialId: { [Op.iLike]: `%${material}%` },
                modifiedAt: {
                    [Op.eq]: Sequelize.literal(`(SELECT MAX("report_items"."modified_at")
                                              FROM "report_items"
                                             WHERE "report_items"."report_id" = "Report"."id"
                                               AND "report_items"."material_id" = "items"."material_id" )`)
                },
                status: RECORD_STATUS.ACTIVE
            }
        }];
    }
}
