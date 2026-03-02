import { Injectable, Logger } from "@nestjs/common";
import { REPORT_TYPES, UNIT_STATUSES } from "src/contants";
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

@Injectable()
export class StandardService {
    private readonly logger = new Logger(StandardService.name);

    constructor(
        private readonly standardRepository: StandardRepository,
        private readonly reportRepository: ReportRepository,
        private readonly unitHierarchyService: UnitHierarchyService,
    ) { }

    // ─────────────────────────────────────────────────────────────────────────
    // Public entry point
    // ─────────────────────────────────────────────────────────────────────────

    async getStandardDrawerData(parentUnitId: number, date: string): Promise<StandardDrawerDataDto[]> {
        // 1. Build ancestor chain: [parentUnit, grandParent, ...]
        const activeRelations = await this.unitHierarchyService.fetchActiveRelations(date);
        const parentByChild = new Map<number, number>();
        const childrenByParent = new Map<number, number[]>();
        for (const rel of activeRelations) {
            parentByChild.set(rel.relatedUnitId, rel.unitId);
            const children = childrenByParent.get(rel.unitId) ?? [];
            children.push(rel.relatedUnitId);
            childrenByParent.set(rel.unitId, children);
        }

        // Build description lookup from relations for child units
        const unitDescriptions = new Map<number, { description: string; level: number }>();
        for (const rel of activeRelations) {
            const detail = (rel as any).relatedUnit?.details?.[0];
            if (detail) {
                unitDescriptions.set(rel.relatedUnitId, {
                    description: detail.description ?? "",
                    level: detail.unitLevelId ?? 0,
                });
            }
            const parentDetail = (rel as any).unit?.details?.[0];
            if (parentDetail) {
                unitDescriptions.set(rel.unitId, {
                    description: parentDetail.description ?? "",
                    level: parentDetail.unitLevelId ?? 0,
                });
            }
        }

        // 2. Get immediate children of the screen unit
        const immediateChildren = childrenByParent.get(parentUnitId) ?? [];
        if (immediateChildren.length === 0) return [];

        // 2a. Fetch statuses for immediate children to determine which are locked
        const childStatusMap = await this.standardRepository.getUnitStatusesForDate(immediateChildren, date);
        // A direct child is "locked" (eligible for standard calculation) if its status
        // is FINISHED or higher. Children with no status entry or below FINISHED are skipped entirely.
        const lockedChildren = immediateChildren.filter(id => {
            const statusId = childStatusMap.get(id);
            return statusId !== undefined && statusId === UNIT_STATUSES.WAITING_FOR_ALLOCATION;
        });

        // 3. Collect all descendant IDs (including parentUnit) for tag lookup
        const allDescendants = this.collectDescendants(parentUnitId, childrenByParent);

        // 4. Build ancestor chain for parentUnit (to filter relevant standards)
        const ancestors = this.buildAncestorChain(parentUnitId, parentByChild);
        const allAncestorIds = [parentUnitId, ...ancestors];

        // 5. Fetch unit standard tags for all ancestors AND descendants
        const allUnitIdsAndAncestors = Array.from(new Set([...allAncestorIds, ...allDescendants]));
        const unitTagsByUnit = await this.standardRepository.getUnitStandardTags(allUnitIdsAndAncestors);

        // 6. Fetch all categories (category_desc + category_groups replaces material_group_collections)
        const { groupToCategoryMap, categories } = await this.standardRepository.getAllCategories();

        // 7. Fetch all live reports for descendants using the EXISTING ReportRepository
        const allUnitIds = [parentUnitId, ...allDescendants];
        const reports = await this.reportRepository.fetchReportsDataForUnits(date, allUnitIds);

        // Build lookup: unitId → materialId → { stockQuan, requisitionQuan, toolQuan }
        const liveDataByUnit = this.buildLiveDataLookup(reports);

        // 8. Get all item group IDs from category_groups
        const allGroupIds = await this.standardRepository.getAllItemGroupIds();

        // 9. Fetch all standards for those item groups
        const allStandards = await this.standardRepository.getStandardsForItemGroups(allGroupIds);

        // 10. Filter to only standards relevant to this unit's tag path
        const relevantStandards = this.filterRelevantStandards(allStandards, allAncestorIds, unitTagsByUnit);

        const groupToMaterialMap = await this.standardRepository.getAllGroupToMaterialMappings();
        const allMaterials = await this.standardRepository.getAllMaterials();

        // 11. For each LOCKED immediate child: recursively calculate standards
        require('fs').appendFileSync('debug_std.log', `[DEBUG] getStandardDrawerData(parentUnitId=${parentUnitId}) - allStandards.length=${allStandards.length}, relevantStandards.length=${relevantStandards.length}, immediateChildren.length=${immediateChildren.length}, lockedChildren.length=${lockedChildren.length}\n`);
        const allCalculatedStandards: CalculatedUnitStandard[] = [];
        for (const childId of lockedChildren) {
            const childTagsByLevel = unitTagsByUnit.get(childId) ?? new Map();
            const childInfo = unitDescriptions.get(childId);
            const calculated = await this.calculateStandardForUnit(
                childId,
                childInfo?.description ?? String(childId),
                childTagsByLevel,
                relevantStandards,
                liveDataByUnit,
                childrenByParent,
                unitDescriptions,
                unitTagsByUnit,
                groupToMaterialMap,
                allMaterials,
                date,
            );
            allCalculatedStandards.push(...calculated);
        }

        require('fs').appendFileSync('debug_std.log', `[DEBUG] allCalculatedStandards.length=${allCalculatedStandards.length}\n`);

        // 12. Group by managing_unit × material_category and map to response DTO
        return this.buildResponse(allCalculatedStandards, groupToCategoryMap, unitDescriptions, allMaterials);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Recursive calculation
    // ─────────────────────────────────────────────────────────────────────────

    private async calculateStandardForUnit(
        unitId: number,
        unitDescription: string,
        unitTagsByLevel: Map<number, string>,
        relevantStandards: RelevantStandard[],
        liveDataByUnit: Map<number, Map<string, LiveMaterialData>>,
        childrenByParent: Map<number, number[]>,
        unitDescriptions: Map<number, { description: string; level: number }>,
        unitTagsAll: Map<number, Map<number, string>>,
        groupToMaterialMap: Map<string, string[]>,
        allMaterials: Map<string, string>,
        date: string,
    ): Promise<CalculatedUnitStandard[]> {
        const results: CalculatedUnitStandard[] = [];
        const unitChildren = childrenByParent.get(unitId) ?? [];
        const unitLevel = unitDescriptions.get(unitId)?.level ?? 0;

        for (const standard of relevantStandards) {
            const { lowestLevel } = standard;

            // ── FUNNEL CHECK ─────────────────────────────────────────────────
            // If the standard defines a tag at THIS unit's level, the unit must
            // match that tag to continue. If no tag is defined at this level,
            // it's a wildcard — every unit at this level passes through.
            const standardTagAtUnitLevel = standard.values.find(v => v.tagLevel === unitLevel)?.tag;
            if (standardTagAtUnitLevel !== undefined) {
                const unitTagAtUnitLevel = unitTagsByLevel.get(unitLevel);
                if (unitTagAtUnitLevel !== standardTagAtUnitLevel) {
                    // This unit doesn't match the required tag — skip this whole branch
                    continue;
                }
            }

            // ── LEAF CHECK ────────────────────────────────────────────────────
            // This unit is a leaf for this standard when its level IS the lowestLevel.
            // (We already passed the funnel check above, so the tag matched or was a wildcard.)
            if (unitLevel === lowestLevel) {
                const materialData = liveDataByUnit.get(unitId) ?? new Map<string, LiveMaterialData>();
                const groupMaterials = groupToMaterialMap.get(standard.itemGroupId) ?? [];

                for (const materialId of groupMaterials) {
                    const data = materialData.get(materialId) ?? { stockQuan: 0, requisitionQuan: 0, toolQuan: null };

                    // Only use the quantity defined at the leaf (lowestLevel) tag
                    const baseStandardQuan = standard.values
                        .filter(v => v.tagLevel === lowestLevel)
                        .reduce((sum, v) => sum + toNum(v.quantity), 0);
                    let actualToolQty: number | null = null;
                    let finalStandardQuan = baseStandardQuan;

                    if (standard.toolGroupId) {
                        const toolMaterials = groupToMaterialMap.get(standard.toolGroupId) ?? [];
                        actualToolQty = toolMaterials.reduce((sum, tmId) => sum + (liveDataByUnit.get(unitId)?.get(tmId)?.stockQuan ?? 0), 0);
                        finalStandardQuan = baseStandardQuan * actualToolQty;
                    }

                    const origins = this.buildOrigins(standard, unitTagsByLevel, baseStandardQuan, actualToolQty);

                    results.push({
                        unitId,
                        unitDescription,
                        standardId: standard.standardId,
                        managingUnit: standard.managingUnit,
                        itemGroupId: standard.itemGroupId,
                        materialId,
                        materialDescription: allMaterials.get(materialId) ?? materialId,
                        toolGroupId: standard.toolGroupId,
                        toolGroupName: standard.toolGroupName,
                        standardQuan: finalStandardQuan,
                        stockQuan: data.stockQuan,
                        toolQuan: actualToolQty,
                        note: standard.values.find(v => v.note)?.note ?? null,
                        lowestLevel,
                        tagsByLevel: unitTagsByLevel,
                        origins,
                    });
                }
            } else if (unitChildren.length > 0) {
                // ── INTERMEDIATE NODE ──────────────────────────────────────────
                // Cascade to children — they will each be funnelled again at their own level
                const childResults: CalculatedUnitStandard[] = [];
                for (const childId of unitChildren) {
                    const childTagsByLevel = unitTagsAll.get(childId) ?? new Map();
                    const childInfo = unitDescriptions.get(childId);
                    const sub = await this.calculateStandardForUnit(
                        childId,
                        childInfo?.description ?? String(childId),
                        childTagsByLevel,
                        [standard],
                        liveDataByUnit,
                        childrenByParent,
                        unitDescriptions,
                        unitTagsAll,
                        groupToMaterialMap,
                        allMaterials,
                        date,
                    );
                    childResults.push(...sub);
                }
                // Aggregate child results upward to this unit
                const aggregated = this.aggregateChildResults(unitId, unitDescription, standard, childResults);
                results.push(...aggregated);
            }
        }

        return results;
    }

    private aggregateChildResults(
        unitId: number,
        unitDescription: string,
        standard: RelevantStandard,
        childResults: CalculatedUnitStandard[],
    ): CalculatedUnitStandard[] {
        const matching = childResults.filter(c => c.standardId === standard.standardId);
        if (matching.length === 0) return [];

        // Because a standard maps to a group which maps to MULTIPLE materials,
        // we must aggregate per material ID
        const byMaterial = new Map<string, CalculatedUnitStandard[]>();
        for (const child of matching) {
            const list = byMaterial.get(child.materialId) ?? [];
            list.push(child);
            byMaterial.set(child.materialId, list);
        }

        const aggregated: CalculatedUnitStandard[] = [];
        for (const [materialId, materialChildren] of byMaterial) {
            const totalStandardQuan = materialChildren.reduce((s, c) => s + c.standardQuan, 0);
            const totalStockQuan = materialChildren.reduce((s, c) => s + c.stockQuan, 0);
            const totalToolQuan = materialChildren.some(c => c.toolQuan !== null)
                ? materialChildren.reduce((s, c) => s + toNum(c.toolQuan), 0)
                : null;

            aggregated.push({
                unitId,
                unitDescription,
                standardId: standard.standardId,
                managingUnit: standard.managingUnit,
                itemGroupId: standard.itemGroupId,
                materialId,
                materialDescription: materialChildren[0].materialDescription,
                toolGroupId: standard.toolGroupId,
                toolGroupName: standard.toolGroupName,
                standardQuan: totalStandardQuan,
                stockQuan: totalStockQuan,
                toolQuan: totalToolQuan,
                note: null, // Don't safely bubble up leaf notes to parents
                lowestLevel: standard.lowestLevel,
                tagsByLevel: new Map(), // Omitted in parent aggregates
                origins: [], // Bubble-up nodes don't have direct origins
            });
        }

        return aggregated;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Relevant standards filtering (algorithm from implementation plan)
    // ─────────────────────────────────────────────────────────────────────────

    private filterRelevantStandards(
        allStandards: RelevantStandard[],
        ancestorUnitIds: number[],
        unitTagsByUnit: Map<number, Map<number, string>>,
    ): RelevantStandard[] {
        const relevant: RelevantStandard[] = [];

        // Sort ancestors ascending by their unit_level (most specific last)
        // We iterate ancestorUnitIds which are already ordered [screen, parent, grandparent, ...]

        for (const standard of allStandards) {
            let keep = true;

            for (const ancestorId of ancestorUnitIds) {
                const ancestorTags = unitTagsByUnit.get(ancestorId) ?? new Map();

                // For each level in the standard, check if ancestor's tag matches
                for (const sv of standard.values) {
                    const ancestorTagAtLevel = ancestorTags.get(sv.tagLevel);
                    if (ancestorTagAtLevel !== undefined && ancestorTagAtLevel !== sv.tag) {
                        // Mismatch: this standard's tag path doesn't match this ancestor
                        keep = false;
                        break;
                    }
                }
                if (!keep) break;
            }

            if (keep) relevant.push(standard);
        }

        return relevant;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Response builder
    // ─────────────────────────────────────────────────────────────────────────

    private buildResponse(
        calculated: CalculatedUnitStandard[],
        groupToCategoryMap: Map<string, import('../models/category-desc.model').CategoryDesc>,
        unitDescriptions: Map<number, { description: string; level: number }>,
        allMaterials: Map<string, string>,
    ): StandardDrawerDataDto[] {
        // Key: `${managingUnit}:${categoryId}`
        const grouped = new Map<string, {
            managing_unit: StandardManagingUnitDto;
            material_category: StandardMaterialCategoryDto;
            byMaterial: Map<string, CalculatedUnitStandard[]>;
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
                    byMaterial: new Map(),
                });
            }

            const group = grouped.get(key)!;
            const materialEntries = group.byMaterial.get(entry.materialId) ?? [];
            materialEntries.push(entry);
            group.byMaterial.set(entry.materialId, materialEntries);
        }

        const result: StandardDrawerDataDto[] = [];
        let priority = 1;
        for (const group of grouped.values()) {
            const materials: StandardMaterialDataDto[] = [];

            for (const [groupId, entries] of group.byMaterial) {
                // Group entries by unitId to avoid repeating rows and double-counting stock
                const unitMap = new Map<number, StandardChildQuantityDto>();
                for (const e of entries) {
                    if (!unitMap.has(e.unitId)) {
                        unitMap.set(e.unitId, {
                            unit_id: e.unitId,
                            unit_description: e.unitDescription,
                            material: { id: groupId, description: allMaterials.get(groupId) ?? groupId },
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
                    if (e.origins) {
                        child.origins!.push(...e.origins);
                    }
                }

                const standardChildren = Array.from(unitMap.values());

                // children_quantities: stock + requisition per unit (read from reports - no duplication)
                const childrenQuantities: ChildQuantityDto[] = standardChildren.map(c => ({
                    unit_id: c.unit_id,
                    unit_description: c.unit_description,
                    material: c.material,
                    requisition_quantity: 0, // Frontend resolves this from its reports store
                    stock_quantity: c.stock_quantity,
                }));

                const totalStandard = standardChildren.reduce((s, c) => s + c.quantity, 0);
                const totalReq = 0; // frontend resolves
                const totalStock = standardChildren.reduce((s, c) => s + c.stock_quantity, 0);

                if (totalStandard > 0) {
                    materials.push({
                        material: { id: groupId, description: groupId },
                        standard_quantity: totalStandard,
                        children_requisition_quantity: totalReq,
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

                const existing = unitData.get(item.materialId) ?? { stockQuan: 0, requisitionQuan: 0, toolQuan: null };

                const qty = toNum(item.confirmedQuantity ?? item.reportedQuantity);

                if (report.reportTypeId === REPORT_TYPES.INVENTORY) {
                    existing.stockQuan += qty;
                } else if (report.reportTypeId === REPORT_TYPES.REQUEST) {
                    existing.requisitionQuan += qty;
                }
                // Tool quantities may be stored as a separate report type in the future
                unitData.set(item.materialId, existing);
            }
        }

        return result;
    }



    private buildOrigins(
        standard: RelevantStandard,
        unitTagsByLevel: Map<number, string>,
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
            per_tool_qty: baseQuan || null,
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
        const map: Record<number, string> = { 0: "מטכ\"ל", 1: "פיקוד", 2: "אוגדה", 3: "חטיבה", 4: "גדוד" };
        return map[level] ?? String(level);
    }
}

type LiveMaterialData = {
    stockQuan: number;
    requisitionQuan: number;
    toolQuan: number | null;
};
