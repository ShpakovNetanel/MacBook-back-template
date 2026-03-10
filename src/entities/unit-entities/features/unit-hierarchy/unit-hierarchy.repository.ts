import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Transaction } from "sequelize";
import { UNIT_RELATION_TYPES } from "src/contants";
import { Unit } from "../../unit/unit.model";
import { UnitRelation } from "../../unit-relations/unit-relation.model";
import { UnitId } from "../../unit-id/unit-id.model";
import { UnitStatus } from "../../units-statuses/units-statuses.model";
import { UnitStatusType } from "../../unit-status-type/unit-status-type.model";
import { UnitUser } from "../../unit-users/unit-user.model";
import { isDefined } from "remeda";

export type UnitRelationEdge = {
  unitId: number;
  relatedUnitId: number;
};

export type UnitDirectParentRelation = {
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
    @InjectModel(UnitStatus) private readonly unitStatusTypesModel: typeof UnitStatus,
    @InjectModel(UnitUser) private readonly unitUser: typeof UnitUser,
    @InjectModel(Unit) private readonly unitDetailModel: typeof Unit,
  ) { }

  fetchUnitUser(username: string, date: string) {
    return this.unitUser.findOne({
      where: {
        userId: username,
        startDate: {
          [Op.lte]: date,
        },
        endDate: {
          [Op.gt]: date
        }
      }
    })
  }

  fetchActive(date: string, unitId?: number) {
    const unitRelationWhereClause = {};

    if (isDefined(unitId)) {
      unitRelationWhereClause['unitId'] = unitId
    };

    return this.unitRelationModel.findAll({
      include: [{
        attributes: ['id'],
        model: UnitId,
        as: 'unit',
        required: true,
        include: [{
          attributes: ['unitStatusId'],
          model: UnitStatus,
          as: 'unitStatus',
          required: false,
          include: [{
            model: UnitStatusType,
            as: "unitStatus",
          }],
          where: {
            date,
          }
        },
        {
          attributes: ["unitId", "description", "tsavIrgunCodeId", "unitLevelId"],
          model: Unit
        }]
      },
      {
        attributes: ['id'],
        model: UnitId,
        as: 'relatedUnit',
        required: true,
        include: [{
          attributes: ['unitStatusId'],
          model: UnitStatus,
          as: 'unitStatus',
          required: false,
          include: [{
            model: UnitStatusType,
            as: "unitStatus",
          }],
          where: {
            date,
          }
        },
        {
          attributes: ["unitId", "description", "tsavIrgunCodeId", "unitLevelId"],
          model: Unit
        }]
      }],
      where: {
        ...unitRelationWhereClause,
        unitRelationId: UNIT_RELATION_TYPES.ZRA,
        startDate: { [Op.lte]: date },
        endDate: { [Op.gt]: date }
      }
    })
  }

  fetchAllActiveUnitDetails(date: string) {
    return this.unitDetailModel.findAll({
      attributes: ["unitId", "description", "tsavIrgunCodeId", "unitLevelId"],
      where: {
        startDate: { [Op.lte]: date },
        endDate: { [Op.gt]: date },
      },
      order: [["startDate", "DESC"]],
    });
  }

  fetchUnitStatusesForDate(date: string, unitIds: number[]) {
    if (unitIds.length === 0) return Promise.resolve([]);

    return this.unitStatusTypesModel.findAll({
      attributes: ["unitId", "unitStatusId", "date"],
      where: {
        unitId: { [Op.in]: unitIds },
        date,
      },
      include: [{
        model: UnitStatusType,
        as: "unitStatus",
      }],
      order: [["date", "DESC"]],
    });
  }

  fetchDirectParentRelations(date: string, childUnitIds: number[]) {
    if (childUnitIds.length === 0) return Promise.resolve([]);

    return this.unitRelationModel.findAll({
      attributes: ["unitId", "relatedUnitId"],
      where: {
        unitRelationId: UNIT_RELATION_TYPES.ZRA,
        relatedUnitId: { [Op.in]: childUnitIds },
        startDate: { [Op.lte]: date },
        endDate: { [Op.gt]: date },
      },
      order: [["startDate", "DESC"]],
    });
  }

  async isUnitUnderRootUnit(
    date: string,
    rootUnitId: number,
    lowerUnitId: number,
    transaction?: Transaction
  ) {
    if (rootUnitId === lowerUnitId) return true;

    const visited = new Set<number>([rootUnitId]);
    let frontier = [rootUnitId];

    while (frontier.length > 0) {
      const relations = await this.unitRelationModel.findAll({
        attributes: ["unitId", "relatedUnitId"],
        where: {
          unitRelationId: UNIT_RELATION_TYPES.ZRA,
          unitId: { [Op.in]: frontier },
          startDate: { [Op.lte]: date },
          endDate: { [Op.gt]: date },
        },
        transaction,
      });

      const next: number[] = [];
      for (const relation of relations) {
        const childId = relation.relatedUnitId;
        if (childId === lowerUnitId) return true;
        if (visited.has(childId)) continue;

        visited.add(childId);
        next.push(childId);
      }

      frontier = next;
    }

    return false;
  }

  fetchUnitsActiveDetails(date: string, unitIds: number[], transaction?: Transaction) {
    if (unitIds.length === 0) return Promise.resolve([]);

    return this.unitDetailModel.findAll({
      attributes: ["unitId", "objectType", "unitLevelId"],
      where: {
        unitId: { [Op.in]: unitIds },
        startDate: { [Op.lte]: date },
        endDate: { [Op.gt]: date },
      },
      order: [["startDate", "DESC"]],
      transaction,
    });
  }

  createParentRelation(
    upperUnit: number,
    lowerUnit: number,
    date: string,
    transaction?: Transaction
  ) {
    return this.unitRelationModel.upsert({
      unitId: upperUnit,
      relatedUnitId: lowerUnit,
      unitRelationId: UNIT_RELATION_TYPES.ZRA,
      unitObjectType: 'O',
      relatedUnitObjectType: 'O',
      startDate: new Date(date),
      endDate: new Date("9999-12-31"),
    }, { transaction });
  }

  fetchCurrentParentRelation(
    lowerUnit: number,
    date: string,
    transaction?: Transaction
  ) {
    return this.unitRelationModel.findOne({
      where: {
        unitRelationId: UNIT_RELATION_TYPES.ZRA,
        relatedUnitId: lowerUnit,
        startDate: { [Op.lte]: date },
        endDate: { [Op.gt]: date },
      },
      order: [["startDate", "DESC"]],
      transaction,
    });
  }

  fetchUnitStatusForDate(
    unitId: number,
    date: string,
    transaction?: Transaction
  ) {
    return this.unitStatusTypesModel.findOne({
      attributes: ["unitStatusId"],
      where: {
        unitId,
        date,
      },
      order: [["date", "DESC"]],
      transaction,
    });
  }

  closeRelationOnDate(
    relation: UnitRelation,
    date: string,
    transaction?: Transaction
  ) {
    return relation.update(
      {
        endDate: new Date(date),
      },
      { transaction }
    );
  }
}
