import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { UNIT_RELATION_TYPES } from "src/contants";
import { UnitDetail } from "../../unit-details/unit-details.model";
import { UnitRelation } from "../../unit-relations/unit-relation.model";
import { Unit } from "../../unit/unit.model";
import { UnitStatusTypes } from "../../units-statuses/units-statuses.model";
import { UnitStatusType } from "../../unit-status-type/unit-status-type.model";

export type UnitRelationEdge = {
  unitId: number;
  relatedUnitId: number;
};

export type UnitDetailSnapshot = {
  unitId: number;
  description: string | null;
  level: number | null;
  simul: string | null;
};

export type UnitStatusSnapshot = {
  id: number;
  description: string;
};

@Injectable()
export class UnitHierarchyRepository {
  constructor(
    @InjectModel(UnitRelation) private readonly unitRelationModel: typeof UnitRelation,
  ) { }
  fetchActive(date: string) {
    return this.unitRelationModel.findAll({
      include: [{
        attributes: ['id'],
        model: Unit,
        as: 'unit',
        required: true,
        on: {
          id: { [Op.col]: 'UnitRelation.unit_id' }
        },
        include: [{
          attributes: ['unitStatusId'],
          model: UnitStatusTypes,
          required: false,
          on: {
            '$unit->unitStatusHistory.unit_id$': { [Op.col]: 'unit.id' }
          },
          include: [{
            model: UnitStatusType
          }],
          where: {
            date,
          }
        },
        {
          attributes: ["unitId", "description", "tsavIrgunCodeId", "unitLevelId"],
          model: UnitDetail
        }]
      },
      {
        attributes: ['id'],
        model: Unit,
        as: 'relatedUnit',
        required: true,
        on: {
          id: { [Op.col]: 'UnitRelation.related_unit_id' }
        },
        include: [{
          attributes: ['unitStatusId'],
          model: UnitStatusTypes,
          as: 'unitStatusHistory',
          required: false,
          on: {
            '$relatedUnit->unitStatusHistory.unit_id$': { [Op.col]: 'relatedUnit.id' }
          },
          include: [{
            model: UnitStatusType
          }],
          where: {
            date,
          }
        },
        {
          attributes: ["unitId", "description", "tsavIrgunCodeId", "unitLevelId"],
          model: UnitDetail
        }]
      }],
      where: {
        unitRelationId: UNIT_RELATION_TYPES.ZRA,
        startDate: { [Op.lt]: date },
        endDate: { [Op.gte]: date }
      },
    })
  }
}
