import { BadGatewayException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { IReportItem, ReportItem } from "../report-item/report-item.model";
import { IReport, Report } from "./report.model";
import { ReportChanges } from "./report.types";
import { isEmpty } from "remeda";
import { UnitRelation } from "src/entities/unit-entities/unit-relations/unit-relation.model";
import { UnitDetail } from "src/entities/unit-entities/unit-details/unit-details.model";
import { UnitStatusTypes } from "src/entities/unit-entities/units-statuses/units-statuses.model";
import { UnitStatusType } from "src/entities/unit-entities/unit-status-type/unit-status-type.model";
import { Material } from "src/entities/material-entities/material/material.model";
import { MaterialNickname } from "src/entities/material-entities/material-nickname/material-nickname.model";
import { MaterialCategory } from "src/entities/material-entities/material-category/material-category.model";
import { MainCategory } from "src/entities/material-entities/categories/categories.model";
import { UnitFavoriteMaterial } from "src/entities/material-entities/unit-favorite-material/unit-favorite-material.model";
import { Comment } from "../comment/comment.model";
import { Stock } from "../stock/stock.model";
import { UNIT_RELATION_TYPES } from "src/contants";



@Injectable()
export class ReportRepository {
    constructor(@InjectModel(Report) private readonly reportModel: typeof Report,
        @InjectModel(ReportItem) private readonly reportItemModel: typeof ReportItem,
        @InjectModel(UnitRelation) private readonly unitRelationModel: typeof UnitRelation,
        @InjectModel(UnitDetail) private readonly unitDetailModel: typeof UnitDetail,
        @InjectModel(UnitStatusTypes) private readonly unitStatusTypesModel: typeof UnitStatusTypes,
        @InjectModel(Material) private readonly materialModel: typeof Material,
        @InjectModel(MaterialNickname) private readonly materialNicknameModel: typeof MaterialNickname,
        @InjectModel(MaterialCategory) private readonly materialCategoryModel: typeof MaterialCategory,
        @InjectModel(UnitFavoriteMaterial) private readonly unitFavoriteMaterialModel: typeof UnitFavoriteMaterial,
        @InjectModel(Comment) private readonly commentModel: typeof Comment,
        @InjectModel(Stock) private readonly stockModel: typeof Stock) { }

    async saveReports({ reportsToSave, transaction, skipEmptyItems = true }: ReportChanges) {
        try {
            for (const reportToSave of reportsToSave) {
                if (isEmpty(reportToSave.items) && skipEmptyItems) return;

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
            console.log(error);

            throw new BadGatewayException('נכשלה פעולת השמירה, יש לנסות שוב')
        }
    }

    upsertReports(reportChanges: ReportChanges) {
        return this.saveReports(reportChanges);
    }

    async fetchParentUnits(date: string, childUnitIds: number[]) {
        if (childUnitIds.length === 0) return new Map<number, number>();

        const now = new Date(date);
        const relations = await this.unitRelationModel.findAll({
            attributes: ["unitId", "relatedUnitId"],
            where: {
                unitRelationId: UNIT_RELATION_TYPES.ZRA,
                relatedUnitId: { [Op.in]: childUnitIds },
                startDate: { [Op.lt]: now },
                endDate: { [Op.gte]: now }
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

    async fetchDescendantUnits(date: string, rootUnitId: number) {
        const now = new Date(date);
        const visited = new Set<number>([rootUnitId]);
        const parentByChild = new Map<number, number>();
        const descendantIds: number[] = [];

        let frontier = [rootUnitId];
        while (frontier.length > 0) {
            const relations = await this.unitRelationModel.findAll({
                attributes: ["unitId", "relatedUnitId"],
                where: {
                    unitRelationId: UNIT_RELATION_TYPES.ZRA,
                    unitId: { [Op.in]: frontier },
                    startDate: { [Op.lt]: now },
                    endDate: { [Op.gte]: now }
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

            frontier = next;
        }

        return { descendantIds, parentByChild };
    }

    async fetchReportsData(date: string, recipientUnitId: number) {
        const now = new Date(date);

        const { descendantIds, parentByChild } = await this.fetchDescendantUnits(date, recipientUnitId);
        const unitIds = [recipientUnitId, ...descendantIds];

        const unitDetails = await this.unitDetailModel.findAll({
            attributes: ["unitId", "description", "unitLevelId", "tsavIrgunCodeId", "startDate"],
            where: {
                unitId: { [Op.in]: unitIds },
                startDate: { [Op.lt]: now },
                endDate: { [Op.gte]: now }
            },
            order: [["startDate", "DESC"]]
        });

        const unitStatuses = await this.unitStatusTypesModel.findAll({
            attributes: ["unitId", "unitStatusId", "date"],
            where: {
                unitId: { [Op.in]: unitIds },
                date: { [Op.lte]: now }
            },
            include: [{
                model: UnitStatusType,
                as: "unitStatus",
                attributes: ["id", "description"]
            }],
            order: [["date", "DESC"]]
        });

        const reports = await this.reportModel.findAll({
            where: {
                unitId: { [Op.in]: descendantIds },
                recipientUnitId: { [Op.in]: unitIds },
                createdOn: { [Op.lte]: now }
            }
        });

        const reportIds = reports.map(report => report.id);

        const reportItems = reportIds.length === 0
            ? []
            : await this.reportItemModel.findAll({
                where: {
                    reportId: { [Op.in]: reportIds }
                }
            });

        const materialIds = Array.from(new Set(reportItems.map(item => item.materialId)));

        const materials = materialIds.length === 0
            ? []
            : await this.materialModel.findAll({
                where: { id: { [Op.in]: materialIds } },
                include: [
                    { model: MaterialNickname, attributes: ["nickname"] },
                    {
                        model: MaterialCategory,
                        include: [{ model: MainCategory, attributes: ["description"] }]
                    }
                ]
            });

        const favorites = materialIds.length === 0
            ? []
            : await this.unitFavoriteMaterialModel.findAll({
                attributes: ["materialId"],
                where: { unitId: recipientUnitId, materialId: { [Op.in]: materialIds } }
            });

        const comments = materialIds.length === 0
            ? []
            : await this.commentModel.findAll({
                where: {
                    unitId: { [Op.in]: descendantIds },
                    materialId: { [Op.in]: materialIds },
                    date: { [Op.lte]: now },
                    recipientUnitId: { [Op.in]: unitIds }
                },
                order: [["date", "DESC"]]
            });

        const stocks = materialIds.length === 0
            ? []
            : await this.stockModel.findAll({
                where: {
                    unitId: recipientUnitId,
                    materialId: { [Op.in]: materialIds },
                    date: { [Op.lte]: now }
                },
                order: [["date", "DESC"]]
            });

        return {
            childUnitIds: descendantIds,
            parentByChild,
            unitDetails,
            unitStatuses,
            reports,
            reportItems,
            materials,
            favorites,
            comments,
            stocks
        };
    }
}
