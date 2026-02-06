import { UnitRelation } from "src/entities/unit-entities/unit-relations/unit-relation.model";
import { UnitHierarchyNode } from "../unit-hierarchy.types";

const DEFAULT_STATUS = { id: 0, description: "בדיווח" };

export const getRootUnit = (
    unitRelations: UnitRelation[],
    unitId: number
): UnitHierarchyNode | null => {
    const relation = unitRelations.find((rel) => rel?.dataValues?.unitId === unitId);

    const unit = relation?.unit?.activeDetail?.dataValues

    return {
        id: unitId,
        description: unit?.description ?? "",
        level: unit?.unitLevelId ?? 0,
        simul: unit?.tsavIrgunCodeId ?? "",
        status: relation?.unit?.unitStatusHistory?.[0]?.unitStatus?.dataValues ?? DEFAULT_STATUS,
        parent: null,
    };
};

const getUnit = (relation: UnitRelation): UnitHierarchyNode => {
    const unit = relation?.relatedUnit?.activeDetail?.dataValues;
    const parentUnit = relation?.unit?.activeDetail?.dataValues;

    return {
        description: unit?.description ?? '',
        id: unit?.unitId ?? 0,
        level: unit?.unitLevelId ?? 0,
        simul: unit?.tsavIrgunCodeId ?? '',
        status: relation?.relatedUnit?.unitStatusHistory?.[0]?.unitStatus?.dataValues ?? DEFAULT_STATUS,
        parent: {
            description: parentUnit?.description ?? '',
            id: parentUnit?.unitId ?? 0,
            level: parentUnit?.unitLevelId ?? 0,
            simul: parentUnit?.tsavIrgunCodeId ?? '',
            status: relation?.unit?.unitStatusHistory?.[0]?.unitStatus?.dataValues ?? DEFAULT_STATUS,
        }
    }
}

export const getHierarchy = (unitsRelations: UnitRelation[], unitsChildren: UnitRelation[]) => {
    const visited = new Set<number>();
    const childrenByParent = new Map<number, UnitRelation[]>();

    for (const relation of unitsRelations) {
        const parentId = relation?.dataValues?.unitId;
        const siblings = childrenByParent.get(parentId) ?? [];
        siblings.push(relation);
        childrenByParent.set(parentId, siblings);
    }

    const buildHierarchy = (relations: UnitRelation[]): UnitHierarchyNode[] => {
        const units: UnitHierarchyNode[] = [];

        for (const relation of relations) {
            const childId = relation?.dataValues?.relatedUnitId;
            if (!childId || visited.has(childId)) continue;

            visited.add(childId);
            units.push(getUnit(relation));

            const descendants = childrenByParent.get(childId);
            if (descendants?.length) {
                units.push(...buildHierarchy(descendants));
            }
        }

        return units;
    };

    return buildHierarchy(unitsChildren);
}
