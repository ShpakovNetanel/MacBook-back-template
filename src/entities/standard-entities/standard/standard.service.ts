import { Injectable } from "@nestjs/common";
import { REPORT_TYPES, UNIT_STATUSES } from "src/constants";
import { ReportRepository } from "src/entities/report-entities/report/report.repository";
import { Report } from "src/entities/report-entities/report/report.model";
import { UnitHierarchyService } from "src/entities/unit-entities/features/unit-hierarchy/unit-hierarchy.service";
import {
    CalculatedUnitStandard,
    ChildQuantityDto,
    RelevantStandard,
    StandardChildQuantityDto,
    StandardDrawerDataDto,
    StandardMaterialCategoryDto,
    StandardMaterialDataDto,
    StandardManagingUnitDto,
    StandardOriginDto,
} from "./standard.types";
import { StandardRepository } from "./standard.repository";

const toNum = (v: string | number | null | undefined): number => {
    const n = Number(v ?? 0);
    return Number.isNaN(n) ? 0 : n;
};

// Units eligible for standard adjustment: they have submitted reports and are awaiting allocation
const ELIGIBLE_STATUSES = new Set([UNIT_STATUSES.WAITING_FOR_ALLOCATION, UNIT_STATUSES.ALLOCATING]);

type LiveMaterialData = {
    stockQuan: number;
    requisitionQuan: number;
};

@Injectable()
export class StandardService {
    constructor(
        private readonly standardRepository: StandardRepository,
        private readonly reportRepository: ReportRepository,
        private readonly unitHierarchyService: UnitHierarchyService,
    ) { }

    async getRelevantToolMaterialIds(screenUnitId: number, date: string): Promise<string[]> {
        const activeRelations = await this.unitHierarchyService.fetchActiveRelations(date);
        const parentByChild = new Map<number, number>();
        for (const rel of activeRelations) parentByChild.set(rel.relatedUnitId, rel.unitId);

        const ancestors = this.buildAncestorChain(screenUnitId, parentByChild);
        const ancestorIds = new Set([screenUnitId, ...ancestors]);
        const allAncestorIds = [screenUnitId, ...ancestors];

        const allGroupIds = await this.standardRepository.getAllItemGroupIds();
        const allStandards = await this.standardRepository.getStandardsForItemGroups(allGroupIds);
        const ancestorManagedStandards = allStandards.filter(s => ancestorIds.has(s.managingUnit));

        const unitTagsByUnit = await this.standardRepository.getUnitStandardTags(allAncestorIds);
        const relevantStandards = this.filterRelevantStandards(ancestorManagedStandards, allAncestorIds, unitTagsByUnit);

        const groupToMaterialMap = await this.standardRepository.getAllGroupToMaterialMappings();
        const toolIds = new Set<string>();
        for (const standard of relevantStandards) {
            if (standard.toolGroupId) {
                toolIds.add(standard.toolGroupId);
                for (const id of (groupToMaterialMap.get(standard.toolGroupId) ?? [])) toolIds.add(id);
            }
        }
        return Array.from(toolIds);
    }

    async getStandardDrawerData(screenUnitId: number, date: string): Promise<StandardDrawerDataDto[]> {
        // 1. Build hierarchy maps
        const activeRelations = await this.unitHierarchyService.fetchActiveRelations(date);
        const parentByChild = new Map<number, number>();
        const childrenByParent = new Map<number, number[]>();
        for (const rel of activeRelations) {
            parentByChild.set(rel.relatedUnitId, rel.unitId);
            const children = childrenByParent.get(rel.unitId) ?? [];
            children.push(rel.relatedUnitId);
            childrenByParent.set(rel.unitId, children);
        }

        // 2. Ancestor chain for the screen unit (used for standard filtering and managing unit lookup)
        const ancestors = this.buildAncestorChain(screenUnitId, parentByChild);
        const ancestorIds = new Set([screenUnitId, ...ancestors]);
        const allAncestorIds = [screenUnitId, ...ancestors];

        // 3. Immediate children — only those with eligible statuses (WAITING_FOR_ALLOCATION or ALLOCATING)
        //    These are the units the screen unit can create/adjust reports for
        const immediateChildren = childrenByParent.get(screenUnitId) ?? [];
        if (immediateChildren.length === 0) return [];

        const childStatusMap = await this.standardRepository.getUnitStatusesForDate(immediateChildren, date);
        const eligibleChildren = immediateChildren.filter(id => {
            const statusId = childStatusMap.get(id);
            return statusId !== undefined && ELIGIBLE_STATUSES.has(statusId);
        });

        if (eligibleChildren.length === 0) return [];

        // 4. Collect all descendants of eligible children for quantity calculation
        const allDescendants = eligibleChildren.flatMap(id => [id, ...this.collectDescendants(id, childrenByParent)]);
        const allRelevantUnitIds = Array.from(new Set([screenUnitId, ...allDescendants]));

        // 5. Unit descriptions and levels (include ancestors so managing unit descriptions resolve correctly)
        const allUnitIdsForDetails = Array.from(new Set([...allRelevantUnitIds, ...allAncestorIds]));
        const unitDetails = await this.standardRepository.getUnitDetails(date, allUnitIdsForDetails);
        const unitDescriptions = new Map<number, { description: string; level: number }>();
        for (const detail of unitDetails) {
            unitDescriptions.set(detail.unitId, {
                description: detail.description ?? "",
                level: detail.unitLevelId ?? 0,
            });
        }

        // 6. Standard tags for all relevant units (ancestors + descendants) for tag-path matching
        const allUnitIdsForTags = Array.from(new Set([...allAncestorIds, ...allDescendants]));
        const unitTagsByUnit = await this.standardRepository.getUnitStandardTags(allUnitIdsForTags);

        // 7. Categories
        const { groupToCategoryMap } = await this.standardRepository.getAllCategories();

        // 8. Live reports (stock + requisition) for all relevant units
        //    materialId in report_items can be a real material ID OR a standard group ID
        const reports = await this.reportRepository.fetchReportsDataForUnits(date, allRelevantUnitIds);
        const liveDataByUnit = this.buildLiveDataLookup(reports);

        // 9. Fetch all standards, then filter to only those managed by the screen unit or its ancestors
        const allGroupIds = await this.standardRepository.getAllItemGroupIds();
        const allStandards = await this.standardRepository.getStandardsForItemGroups(allGroupIds);

        // Filter #4: only standards whose managing unit is the screen unit or one of its ancestors
        const ancestorManagedStandards = allStandards.filter(s => ancestorIds.has(s.managingUnit));

        // Filter: only standards relevant to this screen unit's tag path
        const relevantStandards = this.filterRelevantStandards(ancestorManagedStandards, allAncestorIds, unitTagsByUnit);

        const groupToMaterialMap = await this.standardRepository.getAllGroupToMaterialMappings();
        const allMaterials = await this.standardRepository.getAllMaterials();
        const allGroupNames = await this.standardRepository.getAllGroupNames();

        // 10. Calculate standards for each eligible child (and their subtrees)
        const allCalculatedStandards: CalculatedUnitStandard[] = [];
        for (const childId of eligibleChildren) {
            const childTagsByLevel = unitTagsByUnit.get(childId) ?? new Map();
            const childInfo = unitDescriptions.get(childId);
            const calculated = this.calculateStandardForUnit(
                childId,
                childInfo?.description ?? String(childId),
                childTagsByLevel,
                relevantStandards,
                liveDataByUnit,
                childrenByParent,
                unitDescriptions,
                unitTagsByUnit,
                groupToMaterialMap,
            );
            allCalculatedStandards.push(...calculated);
        }

        return this.buildResponse(allCalculatedStandards, groupToCategoryMap, unitDescriptions, allMaterials, allGroupNames, groupToMaterialMap, liveDataByUnit);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Recursive standard calculation
    // ─────────────────────────────────────────────────────────────────────────

    private calculateStandardForUnit(
        unitId: number,
        unitDescription: string,
        unitTagsByLevel: Map<number, string>,
        relevantStandards: RelevantStandard[],
        liveDataByUnit: Map<number, Map<string, LiveMaterialData>>,
        childrenByParent: Map<number, number[]>,
        unitDescriptions: Map<number, { description: string; level: number }>,
        unitTagsAll: Map<number, Map<number, string>>,
        groupToMaterialMap: Map<string, string[]>,
    ): CalculatedUnitStandard[] {
        const results: CalculatedUnitStandard[] = [];
        const unitChildren = childrenByParent.get(unitId) ?? [];
        const unitLevel = unitDescriptions.get(unitId)?.level ?? 0;

        for (const standard of relevantStandards) {
            const { lowestLevel } = standard;

            // FUNNEL CHECK: if the standard defines a tag at this unit's level,
            // the unit must match it. No tag at this level = wildcard (all pass).
                const standardTagAtUnitLevel = standard.values.find(v => v.tagLevel === unitLevel)?.tag;
                if (standardTagAtUnitLevel !== undefined) {
                    const unitTagAtUnitLevel = unitTagsByLevel.get(unitLevel);
                    if (unitTagAtUnitLevel !== standardTagAtUnitLevel) continue;
            }

            if (unitLevel === lowestLevel) {
                // LEAF: compute this unit's standard quantity
                const unitLiveData = liveDataByUnit.get(unitId) ?? new Map<string, LiveMaterialData>();

                // Sum group-level report AND all individual material reports for the item group
                const stockQuan = this.sumGroupQuantity(unitLiveData, standard.itemGroupId, groupToMaterialMap, 'stockQuan');

                const baseStandardQuan = standard.values
                    .filter(v => v.tagLevel === lowestLevel)
                    .reduce((sum, v) => sum + toNum(v.quantity), 0);

                let toolQuan: number | null = null;
                let finalStandardQuan = baseStandardQuan;

                if (standard.toolGroupId) {
                    // Sum group-level report AND all individual tool material reports
                    toolQuan = this.sumGroupQuantity(unitLiveData, standard.toolGroupId, groupToMaterialMap, 'stockQuan');
                    finalStandardQuan = baseStandardQuan * toolQuan;
                }

                const origins = this.buildOrigins(standard, baseStandardQuan, toolQuan);

                results.push({
                    unitId,
                    unitDescription,
                    standardId: standard.standardId,
                    managingUnit: standard.managingUnit,
                    itemGroupId: standard.itemGroupId,
                    toolGroupId: standard.toolGroupId,
                    toolGroupName: standard.toolGroupName,
                    standardQuan: finalStandardQuan,
                    stockQuan,
                    toolQuan,
                    note: standard.values.find(v => v.note)?.note ?? null,
                    lowestLevel,
                    origins,
                });
            } else if (unitChildren.length > 0) {
                // INTERMEDIATE: recurse into children
                for (const childId of unitChildren) {
                    const childTagsByLevel = unitTagsAll.get(childId) ?? new Map();
                    const childInfo = unitDescriptions.get(childId);
                    const sub = this.calculateStandardForUnit(
                        childId,
                        childInfo?.description ?? String(childId),
                        childTagsByLevel,
                        [standard],
                        liveDataByUnit,
                        childrenByParent,
                        unitDescriptions,
                        unitTagsAll,
                        groupToMaterialMap,
                    );
                    results.push(...sub);
                }
            }
        }

        return results;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Filter standards relevant to the screen unit's ancestor tag path
    // ─────────────────────────────────────────────────────────────────────────

    private filterRelevantStandards(
        standards: RelevantStandard[],
        ancestorUnitIds: number[],
        unitTagsByUnit: Map<number, Map<number, string>>,
    ): RelevantStandard[] {
        return standards.filter(standard => {
            for (const ancestorId of ancestorUnitIds) {
                const ancestorTags = unitTagsByUnit.get(ancestorId) ?? new Map();
                for (const sv of standard.values) {
                    const ancestorTagAtLevel = ancestorTags.get(sv.tagLevel);
                    if (ancestorTagAtLevel !== undefined && ancestorTagAtLevel !== sv.tag) {
                        return false;
                    }
                }
            }
            return true;
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Build the response DTO
    // ─────────────────────────────────────────────────────────────────────────

    private buildResponse(
        calculated: CalculatedUnitStandard[],
        groupToCategoryMap: Map<string, import('../models/category-desc.model').CategoryDesc>,
        unitDescriptions: Map<number, { description: string; level: number }>,
        allMaterials: Map<string, string>,
        allGroupNames: Map<string, string>,
        groupToMaterialMap: Map<string, string[]>,
        liveDataByUnit: Map<number, Map<string, LiveMaterialData>>,
    ): StandardDrawerDataDto[] {
        // Group by managingUnit × categoryId
        const grouped = new Map<string, {
            managing_unit: StandardManagingUnitDto;
            material_category: StandardMaterialCategoryDto;
            // key: itemGroupId → leaf entries (one per unit)
            byGroup: Map<string, CalculatedUnitStandard[]>;
        }>();

        for (const entry of calculated) {
            const category = groupToCategoryMap.get(entry.itemGroupId);
            if (!category) continue;

            const managingInfo = unitDescriptions.get(entry.managingUnit);
            const key = `${entry.managingUnit}:${category.id}`;

            if (!grouped.has(key)) {
                grouped.set(key, {
                    managing_unit: {
                        id: entry.managingUnit,
                        description: managingInfo?.description ?? String(entry.managingUnit),
                        level: managingInfo?.level ?? 0,
                        level_description: this.levelDescription(managingInfo?.level ?? 0),
                    },
                    material_category: { id: category.id, name: category.description },
                    byGroup: new Map(),
                });
            }

            const group = grouped.get(key)!;
            const list = group.byGroup.get(entry.itemGroupId) ?? [];
            list.push(entry);
            group.byGroup.set(entry.itemGroupId, list);
        }

        const result: StandardDrawerDataDto[] = [];
        let priority = 1;

        for (const group of grouped.values()) {
            const materials: StandardMaterialDataDto[] = [];

            for (const [groupId, entries] of group.byGroup) {
                // Use the standard group's own name as the description
                const groupDescription = allGroupNames.get(groupId) ?? allMaterials.get(groupId) ?? groupId;

                const materialDto = { id: groupId, description: groupDescription };

                // Collect tool group material IDs (same for all entries in this group)
                const toolGroupId = entries[0]?.toolGroupId ?? null;
                const toolMaterialIds = toolGroupId ? (groupToMaterialMap.get(toolGroupId) ?? []) : [];

                // Aggregate per unit
                const unitMap = new Map<number, StandardChildQuantityDto>();
                for (const e of entries) {
                    if (!unitMap.has(e.unitId)) {
                        unitMap.set(e.unitId, {
                            unit_id: e.unitId,
                            unit_description: e.unitDescription,
                            material: materialDto,
                            quantity: 0,
                            tool_quantity: null,
                            stock_quantity: e.stockQuan,
                            origins: [],
                        });
                    }
                    const child = unitMap.get(e.unitId)!;
                    child.quantity += e.standardQuan;
                    if (e.toolQuan !== null) {
                        child.tool_quantity = (child.tool_quantity ?? 0) + e.toolQuan;
                    }
                    child.origins.push(...e.origins);
                }

                const standardChildren = Array.from(unitMap.values());
                const childrenQuantities: ChildQuantityDto[] = standardChildren.map(c => ({
                    unit_id: c.unit_id,
                    unit_description: c.unit_description,
                    material: c.material,
                    requisition_quantity: this.sumGroupQuantity(
                        liveDataByUnit.get(c.unit_id) ?? new Map(),
                        groupId,
                        groupToMaterialMap,
                        'requisitionQuan'
                    ),
                    stock_quantity: c.stock_quantity,
                }));

                const totalStandard = standardChildren.reduce((s, c) => s + c.quantity, 0);
                const totalStock = standardChildren.reduce((s, c) => s + c.stock_quantity, 0);
                const totalRequisition = childrenQuantities.reduce((s, c) => s + c.requisition_quantity, 0);

                if (totalStandard >= 0) {  // include zero-standard items so frontend can show them when tool stock changes
                    materials.push({
                        material: materialDto,
                        material_ids: groupToMaterialMap.get(groupId) ?? [],
                        tool_material_ids: toolMaterialIds,
                        standard_quantity: totalStandard,
                        children_requisition_quantity: totalRequisition,
                        children_stock_quantity: totalStock,
                        standard_children_quantities: standardChildren,
                        children_quantities: childrenQuantities,
                    });
                }
            }

            if (materials.length > 0) {
                result.push({
                    managing_unit: group.managing_unit,
                    material_category: group.material_category,
                    priority: priority++,
                    materials,
                });
            }
        }

        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private buildLiveDataLookup(reports: Report[]): Map<number, Map<string, LiveMaterialData>> {
        const result = new Map<number, Map<string, LiveMaterialData>>();

        for (const report of reports) {
            if (!result.has(report.unitId)) {
                result.set(report.unitId, new Map());
            }
            const unitData = result.get(report.unitId)!;

            for (const item of (report.items ?? [])) {
                if (!item.materialId) continue;
                const existing = unitData.get(item.materialId) ?? { stockQuan: 0, requisitionQuan: 0 };
                const qty = toNum(item.confirmedQuantity ?? item.reportedQuantity);

                if (report.reportTypeId === REPORT_TYPES.INVENTORY) {
                    existing.stockQuan += qty;
                } else if (report.reportTypeId === REPORT_TYPES.REQUEST) {
                    existing.requisitionQuan += qty;
                }
                unitData.set(item.materialId, existing);
            }
        }

        return result;
    }

    private sumGroupQuantity(
        unitLiveData: Map<string, LiveMaterialData>,
        groupId: string,
        groupToMaterialMap: Map<string, string[]>,
        field: keyof LiveMaterialData,
    ): number {
        // Sum the group-level report entry (if any) PLUS all individual material entries
        const groupEntry = unitLiveData.get(groupId);
        const groupQuan = groupEntry ? toNum(groupEntry[field]) : 0;
        const individualQuan = (groupToMaterialMap.get(groupId) ?? [])
            .reduce((sum, matId) => sum + toNum(unitLiveData.get(matId)?.[field]), 0);
        return groupQuan + individualQuan;
    }

    private buildOrigins(
        standard: RelevantStandard,
        baseQuan: number,
        toolCount: number | null,
    ): StandardOriginDto[] {
        const totalQuan = toolCount !== null ? baseQuan * toolCount : baseQuan;
        return [{
            standard_attribute_id: standard.standardId,
            managing_unit: String(standard.managingUnit),
            item_group_id: standard.itemGroupId,
            tool_group_id: standard.toolGroupId,
            tool_group_name: standard.toolGroupName,
            tool_quantity: toolCount,
            per_tool_qty: baseQuan ?? null,
            tags: standard.values.map(v => ({ level: v.tagLevel, tag: v.tag })),
            quantity: totalQuan,
        }];
    }

    private buildAncestorChain(unitId: number, parentByChild: Map<number, number>): number[] {
        const ancestors: number[] = [];
        let current = parentByChild.get(unitId);
        while (current !== undefined) {
            ancestors.push(current);
            current = parentByChild.get(current);
        }
        return ancestors;
    }

    private collectDescendants(rootId: number, childrenByParent: Map<number, number[]>): number[] {
        const result: number[] = [];
        const queue = [...(childrenByParent.get(rootId) ?? [])];
        while (queue.length > 0) {
            const id = queue.shift()!;
            result.push(id);
            queue.push(...(childrenByParent.get(id) ?? []));
        }
        return result;
    }

    private levelDescription(level: number): string {
        const map: Record<number, string> = { 0: 'מטכ"ל', 1: "פיקוד", 2: "אוגדה", 3: "חטיבה", 4: "גדוד" };
        return map[level] ?? String(level);
    }
}
