import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { CategoryDesc } from "../models/category-desc.model";
import { CategoryGroup } from "../models/category-group.model";
import { MaterialStandardGroup } from "../models/material-standard-group.model";
import { StandardAttribute } from "../models/standard-attribute.model";
import { StandardGroup } from "../models/standard-group.model";
import { StandardTag } from "../models/standard-tag.model";
import { StandardValue } from "../models/standard-value.model";
import { UnitStandardTag } from "../models/unit-standard-tag.model";
import { RelevantStandard, RelevantStandardValue } from "./standard.types";
import { UnitStatus } from "src/entities/unit-entities/units-statuses/units-statuses.model";
import { Material } from "src/entities/material-entities/material/material.model";
import { Unit } from "src/entities/unit-entities/unit/unit.model";

@Injectable()
export class StandardRepository {
    private readonly logger = new Logger(StandardRepository.name);

    constructor(
        @InjectModel(StandardAttribute) private readonly standardAttributeModel: typeof StandardAttribute,
        @InjectModel(StandardValue) private readonly standardValueModel: typeof StandardValue,
        @InjectModel(StandardTag) private readonly standardTagModel: typeof StandardTag,
        @InjectModel(UnitStandardTag) private readonly unitStandardTagModel: typeof UnitStandardTag,
        @InjectModel(MaterialStandardGroup) private readonly materialStandardGroupModel: typeof MaterialStandardGroup,
        @InjectModel(CategoryDesc) private readonly categoryDescModel: typeof CategoryDesc,
        @InjectModel(CategoryGroup) private readonly categoryGroupModel: typeof CategoryGroup,
        @InjectModel(StandardGroup) private readonly standardGroupModel: typeof StandardGroup,
        @InjectModel(UnitStatus) private readonly unitStatusModel: typeof UnitStatus,
        @InjectModel(Material) private readonly materialModel: typeof Material,
        @InjectModel(Unit) private readonly unitModel: typeof Unit,
        private readonly sequelize: Sequelize,
    ) { }

    /**
     * Fetch all standard tags for a set of units.
     * Returns Map<unitId, Map<unitLevel, tag>>
     */
    async getUnitStandardTags(unitIds: number[]): Promise<Map<number, Map<number, string>>> {
        if (unitIds.length === 0) return new Map();

        const rows = await this.unitStandardTagModel.findAll({
            where: { unitId: { [Op.in]: unitIds } },
            include: [{
                model: StandardTag,
                as: "tag",
                attributes: ["id", "unitLevel", "tag"],
                required: true,
            }],
        });

        const result = new Map<number, Map<number, string>>();
        for (const row of rows) {
            if (!result.has(row.unitId)) {
                result.set(row.unitId, new Map());
            }
            if (row.tag) {
                result.get(row.unitId)!.set(row.tag.unitLevel, row.tag.tag);
            }
        }
        return result;
    }

    /**
     * Get all relevant standards for a set of item groups (standard_groups.id),
     * including their values and the maximum unit_level (lowestLevel) per standard.
     */
    async getStandardsForItemGroups(itemGroupIds: string[]): Promise<RelevantStandard[]> {
        if (itemGroupIds.length === 0) return [];

        const attributes = await this.standardAttributeModel.findAll({
            where: { itemGroupId: { [Op.in]: itemGroupIds } },
            include: [
                {
                    model: StandardValue,
                    as: "values",
                    required: true,
                    include: [{
                        model: StandardTag,
                        as: "tag",
                        attributes: ["id", "unitLevel", "tag"],
                        required: true,
                    }],
                },
                {
                    model: StandardGroup,
                    as: "toolGroup",
                    required: false,
                    attributes: ["id", "name"],
                },
            ],
        });

        return attributes.flatMap((attr): RelevantStandard[] => {
            const values: RelevantStandardValue[] = (attr.values ?? []).map(v => ({
                tagId: v.tagId,
                tagLevel: v.tag!.unitLevel,
                tag: v.tag!.tag,
                quantity: v.quantity,
                note: v.note,
            }));

            // Group values by tagLevel to detect parallel branches
            const byLevel = new Map<number, RelevantStandardValue[]>();
            for (const v of values) {
                const list = byLevel.get(v.tagLevel) ?? [];
                list.push(v);
                byLevel.set(v.tagLevel, list);
            }

            // Find the first level that has multiple parallel tags — this is the branch point
            const parallelLevel = Array.from(byLevel.entries()).find(([, vs]) => vs.length > 1)?.[0];

            if (parallelLevel === undefined) {
                // No parallel tags — single standard as-is
                const lowestLevel = values.reduce((max, v) => Math.max(max, v.tagLevel), 0);
                return [{
                    standardId: attr.id,
                    managingUnit: attr.managingUnit,
                    itemGroupId: attr.itemGroupId,
                    toolGroupId: attr.toolGroupId ?? null,
                    toolGroupName: attr.toolGroup?.name ?? null,
                    lowestLevel,
                    values,
                }];
            }

            // Split into one standard per parallel tag at the branch level
            const sharedValues = values.filter(v => v.tagLevel !== parallelLevel);
            const parallelValues = byLevel.get(parallelLevel)!;

            return parallelValues.map(branchValue => {
                const branchValues = [...sharedValues, branchValue];
                const lowestLevel = branchValues.reduce((max, v) => Math.max(max, v.tagLevel), 0);
                return {
                    standardId: attr.id,
                    managingUnit: attr.managingUnit,
                    itemGroupId: attr.itemGroupId,
                    toolGroupId: attr.toolGroupId ?? null,
                    toolGroupName: attr.toolGroup?.name ?? null,
                    lowestLevel,
                    values: branchValues,
                };
            });
        });
    }

    /**
     * Fetch all categories (category_desc) with their linked standard_groups (via category_groups).
     * category_desc replaces the former material_group_collections table.
     * Returns Map<groupId, CategoryDesc> for fast lookup: which category owns this standard_group?
     */
    async getAllCategories(): Promise<{ groupToCategoryMap: Map<string, CategoryDesc>; categories: CategoryDesc[] }> {
        const categories = await this.categoryDescModel.findAll({
            include: [{
                model: CategoryGroup,
                as: "categoryGroups",
                attributes: ["id", "groupId"],
                required: false,
            }],
        });

        const groupToCategoryMap = new Map<string, CategoryDesc>();
        for (const cat of categories) {
            for (const cg of (cat.categoryGroups ?? [])) {
                // cg.id is the category_desc.id, cg.groupId maps to standard_groups.id
                groupToCategoryMap.set(cg.groupId, cat);
            }
        }

        return { groupToCategoryMap, categories };
    }

    /**
     * Get all item group IDs (standard_groups.id) reachable through any category.
     */
    async getAllItemGroupIds(): Promise<string[]> {
        const rows = await this.categoryGroupModel.findAll({ attributes: ["groupId"] });
        return rows.map(r => r.groupId);
    }

    /**
     * Fetch the mapping of group_id to material_id from material_standard_group.
     * Returns Map<groupId, materialId[]> for translating standard groups to physical materials.
     */
    async getAllGroupToMaterialMappings(): Promise<Map<string, string[]>> {
        const rows = await this.materialStandardGroupModel.findAll({
            attributes: ["groupId", "materialId"],
        });

        const mapping = new Map<string, string[]>();
        for (const row of rows) {
            if (!mapping.has(row.groupId)) {
                mapping.set(row.groupId, []);
            }
            mapping.get(row.groupId)!.push(row.materialId);
        }
        return mapping;
    }

    /**
     * Fetch the unitStatusId for each unit on a given date.
     * Returns Map<unitId, unitStatusId>. Units with no record for the date are absent from the map.
     */
    async getUnitStatusesForDate(unitIds: number[], date: string): Promise<Map<number, number>> {
        if (unitIds.length === 0) return new Map();

        const rows = await this.unitStatusModel.findAll({
            attributes: ["unitId", "unitStatusId"],
            where: {
                unitId: { [Op.in]: unitIds },
                date,
            },
        });

        const result = new Map<number, number>();
        for (const row of rows) {
            result.set(row.unitId, row.unitStatusId);
        }
        return result;
    }

    /**
     * Fetch all standard group names.
     * Returns Map<groupId, name>.
     */
    async getAllGroupNames(): Promise<Map<string, string>> {
        const rows = await this.standardGroupModel.findAll({
            attributes: ["id", "name"],
        });
        const result = new Map<string, string>();
        for (const row of rows) {
            result.set(row.id, row.name ?? row.id);
        }
        return result;
    }

    /**
     * Fetch unit description and level for a specific set of unit IDs on a given date.
     * Returns array of { unitId, description, unitLevelId }.
     */
    async getUnitDetails(date: string, unitIds: number[]): Promise<{ unitId: number; description: string | null; unitLevelId: number | null }[]> {
        if (unitIds.length === 0) return [];

        const rows = await this.unitModel.findAll({
            attributes: ["unitId", "description", "unitLevelId"],
            where: {
                unitId: { [Op.in]: unitIds },
                startDate: { [Op.lte]: date },
                endDate: { [Op.gt]: date },
            },
            order: [["startDate", "DESC"]],
        });

        // Deduplicate — keep only the most recent record per unit
        const seen = new Set<number>();
        const result: { unitId: number; description: string | null; unitLevelId: number | null }[] = [];
        for (const row of rows) {
            if (!seen.has(row.unitId)) {
                seen.add(row.unitId);
                result.push({ unitId: row.unitId, description: row.description, unitLevelId: row.unitLevelId });
            }
        }
        return result;
    }

    /**
     * Fetch all materials (id and description).
     * Returns Map<materialId, description>.
     */
    async getAllMaterials(): Promise<Map<string, string>> {
        const rows = await this.materialModel.findAll({
            attributes: ["id", "description"],
        });
        const result = new Map<string, string>();
        for (const row of rows) {
            result.set(row.id, row.description ?? row.id);
        }
        return result;
    }
}
