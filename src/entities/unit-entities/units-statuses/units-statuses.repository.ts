import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Transaction } from "sequelize";
import { OBJECT_TYPES, UNIT_RELATION_TYPES } from "../../../constants";
import { UnitRelation } from "../unit-relations/unit-relation.model";
import { IUnitStatus, UnitStatus } from "./units-statuses.model";

@Injectable()
export class UnitStatusRepository {
    constructor(
        @InjectModel(UnitStatus) private readonly unitStatusModel: typeof UnitStatus,
        @InjectModel(UnitRelation) private readonly unitRelationModel: typeof UnitRelation,
    ) { }

    async fetchHierarchyUnitIds(date: string, unitIds: number[], transaction?: Transaction) {
        const rootUnitIds = [...new Set(unitIds)];
        if (rootUnitIds.length === 0) return [];

        const now = new Date(date);
        const visited = new Set<number>(rootUnitIds);
        const hierarchyUnitIds = [...rootUnitIds];

        let frontier = rootUnitIds;
        while (frontier.length > 0) {
            const relations = await this.unitRelationModel.findAll({
                attributes: ["relatedUnitId"],
                where: {
                    unitRelationId: UNIT_RELATION_TYPES.ZRA,
                    unitObjectType: OBJECT_TYPES.UNIT,
                    relatedUnitObjectType: OBJECT_TYPES.UNIT,
                    unitId: { [Op.in]: frontier },
                    startDate: { [Op.lt]: now },
                    endDate: { [Op.gte]: now }
                },
                transaction,
            });

            const next: number[] = [];
            for (const relation of relations) {
                const childId = relation.relatedUnitId;
                if (visited.has(childId)) continue;

                visited.add(childId);
                hierarchyUnitIds.push(childId);
                next.push(childId);
            }

            frontier = next;
        }

        return hierarchyUnitIds;
    }

    updateStatuses(unitsStatuses: IUnitStatus[], transaction?: Transaction) {
        return this.unitStatusModel.bulkCreate(unitsStatuses, {
            updateOnDuplicate: ['unitStatusId'],
            transaction
        })
    }

    clearStatusesForUnitsDate(unitIds: number[], date: string, transaction: Transaction) {
        if (unitIds.length === 0) return Promise.resolve(0);

        return this.unitStatusModel.destroy({
            where: {
                unitId: { [Op.in]: unitIds },
                date,
            },
            transaction,
        });
    }

    clearStatusForUnitDate(unitId: number, date: string, transaction?: Transaction) {
        return this.unitStatusModel.destroy({
            where: {
                unitId,
                date,
            },
            transaction,
        });
    }
}
