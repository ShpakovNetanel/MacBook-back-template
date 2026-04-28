"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardRepository = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const material_model_1 = require("../../material-entities/material/material.model");
const unit_model_1 = require("../../unit-entities/unit/unit.model");
const units_statuses_model_1 = require("../../unit-entities/units-statuses/units-statuses.model");
const category_desc_model_1 = require("../category-desc/category-desc.model");
const category_group_model_1 = require("../category-group/category-group.model");
const unit_standard_tag_model_1 = require("../unit-standard-tag/unit-standard-tag.model");
const material_standard_group_model_1 = require("../material-standard-group/material-standard-group.model");
const standard_group_model_1 = require("../standard-group/standard-group.model");
const standard_attribute_model_1 = require("../standard-attribute/standard-attribute.model");
const standard_tag_model_1 = require("../standard-tag/standard-tag.model");
const standard_values_model_1 = require("../standard-values/standard-values.model");
let StandardRepository = class StandardRepository {
    standardAttributeModel;
    unitStandardTagModel;
    materialStandardGroupModel;
    categoryDescModel;
    categoryGroupModel;
    standardGroupModel;
    unitStatusModel;
    materialModel;
    unitModel;
    constructor(standardAttributeModel, unitStandardTagModel, materialStandardGroupModel, categoryDescModel, categoryGroupModel, standardGroupModel, unitStatusModel, materialModel, unitModel) {
        this.standardAttributeModel = standardAttributeModel;
        this.unitStandardTagModel = unitStandardTagModel;
        this.materialStandardGroupModel = materialStandardGroupModel;
        this.categoryDescModel = categoryDescModel;
        this.categoryGroupModel = categoryGroupModel;
        this.standardGroupModel = standardGroupModel;
        this.unitStatusModel = unitStatusModel;
        this.materialModel = materialModel;
        this.unitModel = unitModel;
    }
    async getUnitStandardTags(unitIds) {
        if (unitIds.length === 0)
            return new Map();
        const rows = await this.unitStandardTagModel.findAll({
            where: { unitId: { [sequelize_2.Op.in]: unitIds } },
            include: [{
                    model: standard_tag_model_1.StandardTag,
                    as: "tag",
                    attributes: ["id", "unitLevel", "tag"],
                    required: true,
                }],
        });
        const result = new Map();
        for (const row of rows) {
            if (!result.has(row.unitId)) {
                result.set(row.unitId, new Map());
            }
            if (row.tag) {
                result.get(row.unitId).set(row.tag.unitLevel, row.tag.tag);
            }
        }
        return result;
    }
    async getStandardsForItemGroups(itemGroupIds) {
        if (itemGroupIds.length === 0)
            return [];
        const attributes = await this.standardAttributeModel.findAll({
            where: { itemGroupId: { [sequelize_2.Op.in]: itemGroupIds } },
            include: [
                {
                    model: standard_values_model_1.StandardValues,
                    as: "values",
                    required: true,
                    include: [{
                            model: standard_tag_model_1.StandardTag,
                            as: "tag",
                            attributes: ["id", "unitLevel", "tag"],
                            required: true,
                        }],
                },
                {
                    model: standard_group_model_1.StandardGroup,
                    as: "toolGroup",
                    required: false,
                    attributes: ["id", "name"],
                },
            ],
        });
        return attributes.flatMap((attr) => {
            const values = (attr.values ?? []).map(v => ({
                tagId: v.tagId,
                tagLevel: v.tag.unitLevel,
                tag: v.tag.tag,
                quantity: v.quantity,
                note: v.note,
            }));
            const byLevel = new Map();
            for (const v of values) {
                const list = byLevel.get(v.tagLevel) ?? [];
                list.push(v);
                byLevel.set(v.tagLevel, list);
            }
            const parallelLevel = Array.from(byLevel.entries()).find(([, vs]) => vs.length > 1)?.[0];
            if (parallelLevel === undefined) {
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
            const sharedValues = values.filter(v => v.tagLevel !== parallelLevel);
            const parallelValues = byLevel.get(parallelLevel);
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
    async getAllCategories() {
        const categories = await this.categoryDescModel.findAll({
            include: [{
                    model: category_group_model_1.CategoryGroup,
                    as: "categoryGroups",
                    attributes: ["id", "groupId"],
                    required: false,
                }],
        });
        const groupToCategoryMap = new Map();
        for (const cat of categories) {
            for (const cg of (cat.categoryGroups ?? [])) {
                groupToCategoryMap.set(cg.groupId, cat);
            }
        }
        return { groupToCategoryMap, categories };
    }
    async getAllItemGroupIds() {
        const rows = await this.categoryGroupModel.findAll({ attributes: ["groupId"] });
        return rows.map(r => r.groupId);
    }
    async getAllGroupToMaterialMappings() {
        const rows = await this.materialStandardGroupModel.findAll({
            attributes: ["groupId", "materialId"],
        });
        const mapping = new Map();
        for (const row of rows) {
            if (!mapping.has(row.groupId)) {
                mapping.set(row.groupId, []);
            }
            mapping.get(row.groupId).push(row.materialId);
        }
        return mapping;
    }
    async getUnitStatusesForDate(unitIds, date) {
        if (unitIds.length === 0)
            return new Map();
        const rows = await this.unitStatusModel.findAll({
            attributes: ["unitId", "unitStatusId"],
            where: {
                unitId: { [sequelize_2.Op.in]: unitIds },
                date,
            },
        });
        const result = new Map();
        for (const row of rows) {
            result.set(row.unitId, row.unitStatusId);
        }
        return result;
    }
    async getAllGroupNames() {
        const rows = await this.standardGroupModel.findAll({
            attributes: ["id", "name"],
        });
        const result = new Map();
        for (const row of rows) {
            result.set(row.id, row.name ?? row.id);
        }
        return result;
    }
    async getUnitDetails(date, unitIds) {
        if (unitIds.length === 0)
            return [];
        const rows = await this.unitModel.findAll({
            attributes: ["unitId", "description", "unitLevelId", "tsavIrgunCodeId"],
            where: {
                unitId: { [sequelize_2.Op.in]: unitIds },
                startDate: { [sequelize_2.Op.lte]: date },
                endDate: { [sequelize_2.Op.gt]: date },
            },
            order: [["startDate", "DESC"]],
        });
        const seen = new Set();
        const result = [];
        for (const row of rows) {
            if (!seen.has(row.unitId)) {
                seen.add(row.unitId);
                result.push({ unitId: row.unitId, description: row.description, unitLevelId: row.unitLevelId, simul: row.tsavIrgunCodeId });
            }
        }
        return result;
    }
    async getAllMaterials() {
        const rows = await this.materialModel.findAll({
            attributes: ["id", "description"],
        });
        const result = new Map();
        for (const row of rows) {
            result.set(row.id, row.description ?? row.id);
        }
        return result;
    }
};
exports.StandardRepository = StandardRepository;
exports.StandardRepository = StandardRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(standard_attribute_model_1.StandardAttribute)),
    __param(1, (0, sequelize_1.InjectModel)(unit_standard_tag_model_1.UnitStandardTags)),
    __param(2, (0, sequelize_1.InjectModel)(material_standard_group_model_1.MaterialStandardGroup)),
    __param(3, (0, sequelize_1.InjectModel)(category_desc_model_1.CategoryDesc)),
    __param(4, (0, sequelize_1.InjectModel)(category_group_model_1.CategoryGroup)),
    __param(5, (0, sequelize_1.InjectModel)(standard_group_model_1.StandardGroup)),
    __param(6, (0, sequelize_1.InjectModel)(units_statuses_model_1.UnitStatus)),
    __param(7, (0, sequelize_1.InjectModel)(material_model_1.Material)),
    __param(8, (0, sequelize_1.InjectModel)(unit_model_1.Unit)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], StandardRepository);
//# sourceMappingURL=standard.repository.js.map