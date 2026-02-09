import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { UNIT_RELATION_TYPES } from "src/contants";
import { UnitRelation } from "../unit-relations/unit-relation.model";
import { IUnitStatusTypes, UnitStatusTypes } from "./units-statuses.model";

@Injectable()
export class UnitStatusTypesRepository {
    constructor(
        @InjectModel(UnitStatusTypes) private readonly unitStatusHistoryModel: typeof UnitStatusTypes,
        @InjectModel(UnitRelation) private readonly unitRelationModel: typeof UnitRelation,
    ) { }

    async fetchHierarchyUnitIds(date: string, unitIds: number[]) {
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
                    unitId: { [Op.in]: frontier },
                    startDate: { [Op.lt]: now },
                    endDate: { [Op.gte]: now }
                }
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

    updateStatuses(unitsStatuses: IUnitStatusTypes[]) {
        return this.unitStatusHistoryModel.bulkCreate(unitsStatuses, {
            updateOnDuplicate: ['unitStatusId'],
        })
    }
}
