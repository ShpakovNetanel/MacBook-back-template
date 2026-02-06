import { Injectable } from "@nestjs/common";
import { UnitHierarchyRepository } from "./unit-hierarchy.repository";
import { UnitHierarchyNode } from "./unit-hierarchy.types";
import { getHierarchy, getRootUnit } from "./utilities/hierarchyRecursion";
import { UnitRelation } from "../../unit-relations/unit-relation.model";

const DEFAULT_STATUS = { id: 0, description: "בדיווח" };

@Injectable()
export class UnitHierarchyService {
  constructor(private readonly repository: UnitHierarchyRepository) { }

  async getHierarchyForUser(rootUnit: number, date: string) {
    try {
      const unitsRelations = await this.repository.fetchActive(date);

      const rootChildren = unitsRelations.filter(
        (relation) => relation?.dataValues?.unitId === rootUnit
      );

      const hierarchy = getHierarchy(unitsRelations as UnitRelation[], rootChildren);
      const rootNode = getRootUnit(unitsRelations as UnitRelation[], rootUnit);

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
      console.log(error);
    }
  }
}
