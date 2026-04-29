import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { UnitHierarchyRepository } from './unit-hierarchy.repository';
import { UnitHierarchyNode } from './unit-hierarchy.types';
import {
  getEmergencyUnitIds,
  getHierarchy,
  getRootUnit,
} from './utilities/hierarchyRecursion';
import { UnitRelation } from '../../unit-relations/unit-relation.model';
import { RemoveUnitRelationDto } from './DTO/remove-unit-relation.dto';
import { AddUnitRelationDto } from './DTO/add-unit-relation.dto';
import { TransferUnitRelationDto } from './DTO/update-unit-relation.dto';
import { MESSAGE_TYPES, UNIT_STATUSES } from '../../../../constants';
import { Unit } from '../../unit/unit.model';
import { UnitStatus } from '../../units-statuses/units-statuses.model';
import { UnitStatusRepository } from '../../units-statuses/units-statuses.repository';
import { ReportRoutingRepository } from '../../../report-entities/report/report-routing.repository';
import { formatDate } from '../../../../utils/date';
import { isDefined, isEmptyish } from 'remeda';
import { UserRepository } from '../../users/user.repository';

const DEFAULT_STATUS = { id: 0, description: 'בדיווח' };
const DATE_MISMATCH_ERROR = 'לא ניתן לבצע שינוי היררכי על ימים עברו';
const REMOVE_PARENT_LOCKED_ERROR = 'יחידה האב נעולה, אין אפשרות למחוק את הקשר';
const TRANSFER_PARENT_LOCKED_ERROR =
  'יחידה האב נעולה, אין אפשרות להעביר את הקשר';
const SELF_RELATION_ERROR = 'לא ניתן לקשר יחידה לעצמה';
const NOT_UNDER_ROOT_UNIT_ERROR = 'היחידה שניסית להעביר אינה תחתייך';
const LOWER_LEVEL_ERROR = 'לא ניתן להוסיף יחידה לרמה היררכית נמוכה ממנה';
const CREATE_UPPER_NOT_UNDER_ROOT_UNIT_ERROR =
  'היחידה אליה ניסית להוסיף קשר, אינה תחתייך';
const TRANSFER_UPPER_NOT_UNDER_ROOT_UNIT_ERROR =
  'היחידה אליה ניסית להעביר את הקשר, אינה תחתייך';
const LOWER_UNIT_HAS_ANOTHER_ACTIVE_RELATION_ERROR =
  'החידה שניסית להוסיף מקושרת ליחידה אחרת';
const RELATION_ALREADY_EXISTS_ERROR = 'הקשר כבר קיים';
const ADD_PARENT_LOCKED_ERROR = 'יחידת האב נעולה, אין אפשרות ליצור את הקשר';

@Injectable()
export class UnitHierarchyService {
  private readonly logger = new Logger(UnitHierarchyService.name);

  constructor(
    private readonly repository: UnitHierarchyRepository,
    private readonly sequelize: Sequelize,
    private readonly unitStatusTypesRepository: UnitStatusRepository,
    private readonly reportRoutingRepository: ReportRoutingRepository,
    private readonly unitUserRepository: UserRepository,
  ) {}

  async getHierarchyForUser(
    username: string,
    date: string,
  ): Promise<UnitHierarchyNode[]> {
    try {
      const userUnit = await this.unitUserRepository.fetchUnitUser(username);
      const rootUnit = userUnit?.dataValues.unitId;

      if (!isDefined(rootUnit)) {
        throw new BadGatewayException({
          message: 'אינך מקושר ליחידה ארגונית',
          type: 'Fatal',
        });
      }

      const unitsRelations = (await this.repository.fetchActive(
        date,
      )) as UnitRelation[];
      const emergencyUnitIds = getEmergencyUnitIds(unitsRelations);

      const rootChildren = unitsRelations.filter(
        (relation) => relation?.dataValues?.unitId === rootUnit,
      );

      const hierarchy = getHierarchy(
        unitsRelations,
        rootChildren,
        emergencyUnitIds,
      );

      const rootNode = getRootUnit(unitsRelations, rootUnit, emergencyUnitIds);

      if (isEmptyish(rootNode?.description)) {
        throw new BadGatewayException({
          message: 'היחידה שאליה אתה מקושר לא קיימת, יש ליצור קשר עם התמיכה',
          type: 'Fatal',
        });
      }

      if (isEmptyish(hierarchy)) {
        throw new BadGatewayException({
          message: 'אין היררכיה ליחידה הנתונה',
          type: 'Fatal',
        });
      }

      const normalized = hierarchy.map((node) => ({
        ...node,
        status: node.status ?? DEFAULT_STATUS,
        parent: node.parent
          ? {
              ...node.parent,
              status: node.parent.status ?? DEFAULT_STATUS,
            }
          : null,
      }));

      if (!rootNode) return normalized;

      return [
        {
          ...rootNode,
          status: rootNode.status ?? DEFAULT_STATUS,
          parent: null,
        },
        ...normalized,
      ].sort((a, b) => a.level - b.level);
    } catch (error) {
      this.logger.error(
        'Failed to fetch hierarchy for user',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async getAllUnitsWithParents(date: string) {
    const unitDetails = await this.repository.fetchAllActiveUnitDetails(date);
    if (unitDetails.length === 0) return [];

    const uniqueUnitIds = Array.from(
      new Set(unitDetails.map((detail) => detail.unitId)),
    );
    const [unitStatuses, directParentRelations] = await Promise.all([
      this.repository.fetchUnitStatusesForDate(date, uniqueUnitIds),
      this.repository.fetchDirectParentRelations(date, uniqueUnitIds),
    ]);

    const detailByUnit = new Map<number, Unit>();
    for (const detail of unitDetails) {
      if (!detailByUnit.has(detail.unitId)) {
        detailByUnit.set(detail.unitId, detail);
      }
    }

    const statusByUnit = new Map<number, UnitStatus>();
    for (const status of unitStatuses) {
      if (!statusByUnit.has(status.unitId)) {
        statusByUnit.set(status.unitId, status);
      }
    }

    const parentByChild = new Map<number, number>();
    const parentIdsByChild = new Map<number, number[]>();
    for (const relation of directParentRelations) {
      if (!parentByChild.has(relation.relatedUnitId)) {
        parentByChild.set(relation.relatedUnitId, relation.unitId);
      }

      const parentIds = parentIdsByChild.get(relation.relatedUnitId) ?? [];
      parentIds.push(relation.unitId);
      parentIdsByChild.set(relation.relatedUnitId, parentIds);
    }

    const emergencyUnitIds = new Set<number>();
    const gdudUnitIds: number[] = [];
    for (const unitId of uniqueUnitIds) {
      const level = detailByUnit.get(unitId)?.unitLevelId ?? 0;
      if (level === 4) {
        emergencyUnitIds.add(unitId);
        gdudUnitIds.push(unitId);
      }
    }

    const queue = [...gdudUnitIds];
    while (queue.length > 0) {
      const childId = queue.shift();
      if (!childId) continue;

      const parentIds = parentIdsByChild.get(childId) ?? [];
      for (const parentId of parentIds) {
        if (emergencyUnitIds.has(parentId)) continue;
        emergencyUnitIds.add(parentId);
        queue.push(parentId);
      }
    }

    const units = uniqueUnitIds.map((unitId): UnitHierarchyNode => {
      const detail = detailByUnit.get(unitId);
      const status =
        statusByUnit.get(unitId)?.unitStatus?.dataValues ?? DEFAULT_STATUS;
      const parentId = parentByChild.get(unitId);

      const parent = parentId
        ? {
            id: parentId,
            description: detailByUnit.get(parentId)?.description ?? '',
            level: detailByUnit.get(parentId)?.unitLevelId ?? 0,
            simul: detailByUnit.get(parentId)?.tsavIrgunCodeId ?? '',
            status:
              statusByUnit.get(parentId)?.unitStatus?.dataValues ??
              DEFAULT_STATUS,
          }
        : null;

      return {
        id: unitId,
        description: detail?.description ?? '',
        level: detail?.unitLevelId ?? 0,
        simul: detail?.tsavIrgunCodeId ?? '',
        isEmergencyUnit: emergencyUnitIds.has(unitId),
        status,
        parent,
      };
    });

    return units.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.id - b.id;
    });
  }

  async removeUnitRelation(
    removeUnitRelationDto: RemoveUnitRelationDto,
    date: string,
  ) {
    const { formattedDate } = formatDate(new Date());

    if (date !== formattedDate) {
      throw new BadRequestException({
        message: DATE_MISMATCH_ERROR,
        type: MESSAGE_TYPES.FAILURE,
      });
    }

    const { lowerUnit, upperUnit } = removeUnitRelationDto;
    const transaction = await this.sequelize.transaction();

    try {
      if (removeUnitRelationDto.rootUnit !== null) {
        const isUnderRootUnit = await this.repository.isUnitUnderRootUnit(
          formattedDate,
          removeUnitRelationDto.rootUnit,
          lowerUnit,
          transaction,
        );

        if (!isUnderRootUnit) {
          throw new BadRequestException({
            message: NOT_UNDER_ROOT_UNIT_ERROR,
            type: MESSAGE_TYPES.FAILURE,
          });
        }
      }

      const activeRelation = await this.repository.fetchCurrentParentRelation(
        lowerUnit,
        formattedDate,
        transaction,
      );

      if (!activeRelation || activeRelation.unitId !== upperUnit) {
        throw new BadRequestException({
          message: `היחידה ${lowerUnit} כבר לא מקושרת אל היחידה ${upperUnit} יש לרענן את המסך`,
          type: MESSAGE_TYPES.FAILURE,
        });
      }

      const parentUnitStatus = await this.repository.fetchUnitStatusForDate(
        activeRelation.unitId,
        formattedDate,
        transaction,
      );
      const parentStatusId =
        parentUnitStatus?.unitStatusId ?? UNIT_STATUSES.REQUESTING;

      if (parentStatusId !== UNIT_STATUSES.REQUESTING) {
        throw new BadRequestException({
          message: REMOVE_PARENT_LOCKED_ERROR,
          type: MESSAGE_TYPES.FAILURE,
        });
      }

      const hierarchyUnitIds =
        await this.unitStatusTypesRepository.fetchHierarchyUnitIds(
          formattedDate,
          [lowerUnit],
          transaction,
        );
      await this.unitStatusTypesRepository.clearStatusesForUnitsDate(
        hierarchyUnitIds,
        formattedDate,
        transaction,
      );

      await this.repository.closeRelationOnDate(
        activeRelation,
        formattedDate,
        transaction,
      );
      await this.reportRoutingRepository.rerouteUnitReportsToParentForDate(
        lowerUnit,
        formattedDate,
        null,
        null,
        null,
        transaction,
      );

      await transaction.commit();
      return {
        message: 'הקשר ההיררכי הוסר בהצלחה',
        type: MESSAGE_TYPES.SUCCESS,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async addUnitRelation(
    addUnitRelationDto: AddUnitRelationDto,
    date: string,
    username: string,
  ) {
    const { formattedDate } = formatDate(new Date());

    if (date !== formattedDate) {
      throw new BadRequestException({
        message: DATE_MISMATCH_ERROR,
        type: MESSAGE_TYPES.FAILURE,
      });
    }

    const { lowerUnit, upperUnit } = addUnitRelationDto;
    if (lowerUnit === upperUnit) {
      throw new BadRequestException({
        message: SELF_RELATION_ERROR,
        type: MESSAGE_TYPES.FAILURE,
      });
    }

    const transaction = await this.sequelize.transaction();

    try {
      if (addUnitRelationDto.rootUnit === null) {
        throw new BadRequestException({
          message: CREATE_UPPER_NOT_UNDER_ROOT_UNIT_ERROR,
          type: MESSAGE_TYPES.FAILURE,
        });
      }

      const isUpperUnitUnderRootUnit =
        await this.repository.isUnitUnderRootUnit(
          formattedDate,
          addUnitRelationDto.rootUnit,
          upperUnit,
          transaction,
        );

      if (!isUpperUnitUnderRootUnit) {
        throw new BadRequestException({
          message: CREATE_UPPER_NOT_UNDER_ROOT_UNIT_ERROR,
          type: MESSAGE_TYPES.FAILURE,
        });
      }

      const activeRelation = await this.repository.fetchCurrentParentRelation(
        lowerUnit,
        formattedDate,
        transaction,
      );

      if (activeRelation?.unitId === upperUnit) {
        throw new BadRequestException({
          message: RELATION_ALREADY_EXISTS_ERROR,
          type: MESSAGE_TYPES.FAILURE,
        });
      }

      const hasOpenRelationWithAnotherUnit =
        !!activeRelation &&
        activeRelation.unitId !== upperUnit &&
        activeRelation.endDate instanceof Date &&
        activeRelation.endDate.getUTCFullYear() === 9999;

      if (hasOpenRelationWithAnotherUnit) {
        throw new BadRequestException({
          message: LOWER_UNIT_HAS_ANOTHER_ACTIVE_RELATION_ERROR,
          type: MESSAGE_TYPES.FAILURE,
        });
      }

      const parentUnitStatus = await this.repository.fetchUnitStatusForDate(
        upperUnit,
        formattedDate,
        transaction,
      );
      const parentStatusId =
        parentUnitStatus?.unitStatusId ?? UNIT_STATUSES.REQUESTING;

      if (parentStatusId !== UNIT_STATUSES.REQUESTING) {
        throw new BadRequestException({
          message: ADD_PARENT_LOCKED_ERROR,
          type: MESSAGE_TYPES.FAILURE,
        });
      }

      const details = await this.repository.fetchUnitsActiveDetails(
        formattedDate,
        [upperUnit, lowerUnit],
        transaction,
      );

      const detailsByUnit = new Map<number, number>();
      for (const detail of details) {
        if (!detailsByUnit.has(detail.unitId)) {
          detailsByUnit.set(detail.unitId, detail.unitLevelId);
        }
      }

      const upperUnitLevel = detailsByUnit.get(upperUnit) ?? 0;
      const lowerUnitLevel = detailsByUnit.get(lowerUnit) ?? 0;

      if (upperUnitLevel > lowerUnitLevel) {
        throw new BadRequestException({
          message: LOWER_LEVEL_ERROR,
          type: MESSAGE_TYPES.FAILURE,
        });
      }

      if (activeRelation) {
        await this.repository.closeRelationOnDate(
          activeRelation,
          formattedDate,
          transaction,
        );
      }

      await this.repository.createParentRelation(
        upperUnit,
        lowerUnit,
        formattedDate,
        transaction,
      );

      await this.reportRoutingRepository.rerouteUnitReportsToParentForDate(
        lowerUnit,
        formattedDate,
        upperUnit,
        addUnitRelationDto.rootUnit,
        username,
        transaction,
      );

      await transaction.commit();
      return {
        message: 'הקשר ההיררכי נוסף בהצלחה',
        type: MESSAGE_TYPES.SUCCESS,
      };
    } catch (error) {
      this.logger.error(
        'Failed to add unit relation',
        error instanceof Error ? error.stack : String(error),
      );
      await transaction.rollback();
      throw error;
    }
  }

  async transferUnitRelation(
    transferUnitRelationDto: TransferUnitRelationDto,
    date: string,
    username: string,
  ) {
    const { formattedDate } = formatDate(new Date());

    if (date !== formattedDate) {
      throw new BadRequestException({
        message: DATE_MISMATCH_ERROR,
        type: MESSAGE_TYPES.FAILURE,
      });
    }

    const { lowerUnit, upperUnit } = transferUnitRelationDto;
    if (lowerUnit === upperUnit) {
      throw new BadRequestException({
        message: SELF_RELATION_ERROR,
        type: MESSAGE_TYPES.FAILURE,
      });
    }

    const transaction = await this.sequelize.transaction();

    try {
      const [isLowerUnderRootUnit, isUpperUnitUnderRootUnit] =
        await Promise.all([
          this.repository.isUnitUnderRootUnit(
            formattedDate,
            transferUnitRelationDto.rootUnit,
            lowerUnit,
            transaction,
          ),
          this.repository.isUnitUnderRootUnit(
            formattedDate,
            transferUnitRelationDto.rootUnit,
            upperUnit,
            transaction,
          ),
        ]);

      if (!isLowerUnderRootUnit) {
        throw new BadRequestException({
          message: NOT_UNDER_ROOT_UNIT_ERROR,
          type: MESSAGE_TYPES.FAILURE,
        });
      }

      if (!isUpperUnitUnderRootUnit) {
        throw new BadRequestException({
          message: TRANSFER_UPPER_NOT_UNDER_ROOT_UNIT_ERROR,
          type: MESSAGE_TYPES.FAILURE,
        });
      }

      const activeRelation = await this.repository.fetchCurrentParentRelation(
        lowerUnit,
        formattedDate,
        transaction,
      );

      if (activeRelation?.unitId === upperUnit) {
        throw new BadRequestException({
          message: RELATION_ALREADY_EXISTS_ERROR,
          type: MESSAGE_TYPES.FAILURE,
        });
      }

      if (activeRelation) {
        const currentParentUnitStatus =
          await this.repository.fetchUnitStatusForDate(
            activeRelation.unitId,
            formattedDate,
            transaction,
          );
        const currentParentStatusId =
          currentParentUnitStatus?.unitStatusId ?? UNIT_STATUSES.REQUESTING;

        if (currentParentStatusId !== UNIT_STATUSES.REQUESTING) {
          throw new BadRequestException({
            message: TRANSFER_PARENT_LOCKED_ERROR,
            type: MESSAGE_TYPES.FAILURE,
          });
        }
      }

      const parentUnitStatus = await this.repository.fetchUnitStatusForDate(
        upperUnit,
        formattedDate,
        transaction,
      );
      const parentStatusId =
        parentUnitStatus?.unitStatusId ?? UNIT_STATUSES.REQUESTING;

      if (parentStatusId !== UNIT_STATUSES.REQUESTING) {
        throw new BadRequestException({
          message: ADD_PARENT_LOCKED_ERROR,
          type: MESSAGE_TYPES.FAILURE,
        });
      }

      const details = await this.repository.fetchUnitsActiveDetails(
        formattedDate,
        [upperUnit, lowerUnit],
        transaction,
      );

      const detailsByUnit = new Map<number, number>();
      for (const detail of details) {
        if (!detailsByUnit.has(detail.unitId)) {
          detailsByUnit.set(detail.unitId, detail.unitLevelId);
        }
      }

      const upperUnitLevel = detailsByUnit.get(upperUnit) ?? 0;
      const lowerUnitLevel = detailsByUnit.get(lowerUnit) ?? 0;

      if (upperUnitLevel > lowerUnitLevel) {
        throw new BadRequestException({
          message: LOWER_LEVEL_ERROR,
          type: MESSAGE_TYPES.FAILURE,
        });
      }

      if (activeRelation) {
        await this.repository.closeRelationOnDate(
          activeRelation,
          formattedDate,
          transaction,
        );
      }

      await this.repository.createParentRelation(
        upperUnit,
        lowerUnit,
        formattedDate,
        transaction,
      );

      const hierarchyUnitIds =
        await this.unitStatusTypesRepository.fetchHierarchyUnitIds(
          formattedDate,
          [lowerUnit],
          transaction,
        );
      await this.unitStatusTypesRepository.clearStatusesForUnitsDate(
        hierarchyUnitIds,
        formattedDate,
        transaction,
      );

      await this.reportRoutingRepository.rerouteUnitReportsToParentForDate(
        lowerUnit,
        formattedDate,
        upperUnit,
        transferUnitRelationDto.rootUnit,
        username,
        transaction,
      );

      await transaction.commit();
      return {
        message: 'הקשר ההיררכי הועבר בהצלחה',
        type: MESSAGE_TYPES.SUCCESS,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getNestedHierarchyByRootUnit(rootUnit: Number, date: string) {
    const allRelations = (await this.repository.fetchActive(
      date,
    )) as UnitRelation[];
    const emergencyUnitIds = getEmergencyUnitIds(allRelations);

    const rootChildren = allRelations.filter(
      (relation) => relation?.dataValues?.unitId === Number(rootUnit),
    );

    return rootChildren.map((childRelation) => {
      const childId = childRelation?.dataValues?.relatedUnitId;
      const childDetail = childRelation?.relatedUnit?.activeDetail?.dataValues;

      const childHierarchy = allRelations.filter(
        (relation) => relation?.dataValues?.unitId === childId,
      );

      const hierarchy = getHierarchy(
        allRelations,
        childHierarchy,
        emergencyUnitIds,
      );

      return {
        id: childId,
        description: childDetail?.description ?? '',
        level: childDetail?.unitLevelId ?? 0,
        simul: childDetail?.tsavIrgunCodeId ?? '',
        isEmergencyUnit: emergencyUnitIds.has(childId),
        children: hierarchy.map((childRelatedUnit) => {
          const { parent, ...children } = childRelatedUnit;
          return {
            ...children,
            status: childRelatedUnit.status ?? DEFAULT_STATUS,
          };
        }),
      };
    });
  }

  async fetchLowerUnits(date: string, unitId: number) {
    return await this.repository.fetchActive(date, unitId);
  }

  async fetchActiveRelations(date: string): Promise<UnitRelation[]> {
    return this.repository.fetchActive(date) as Promise<UnitRelation[]>;
  }

  fetchUnitStatusForDate(unitId: number, date: string) {
    return this.repository.fetchUnitStatusForDate(unitId, date);
  }

  buildEmergencyUnitLookup(relations: UnitRelation[]): Record<number, boolean> {
    const lookup: Record<number, boolean> = {};
    for (const unitId of getEmergencyUnitIds(relations)) {
      lookup[unitId] = true;
    }

    return lookup;
  }
}
