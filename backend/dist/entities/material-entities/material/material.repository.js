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
exports.MaterialRepository = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const material_model_1 = require("./material.model");
const sequelize_2 = require("sequelize");
const material_category_model_1 = require("../material-category/material-category.model");
const categories_model_1 = require("../categories/categories.model");
const constants_1 = require("../../../constants");
const material_nickname_model_1 = require("../material-nickname/material-nickname.model");
const unit_favorite_material_model_1 = require("../unit-favorite-material/unit-favorite-material.model");
const comment_model_1 = require("../../report-entities/comment/comment.model");
const standard_group_model_1 = require("../../standard-entities/standard-group/standard-group.model");
let MaterialRepository = class MaterialRepository {
    materialModel;
    commentModel;
    unitFavoriteMaterialModel;
    standardGroupModel;
    constructor(materialModel, commentModel, unitFavoriteMaterialModel, standardGroupModel) {
        this.materialModel = materialModel;
        this.commentModel = commentModel;
        this.unitFavoriteMaterialModel = unitFavoriteMaterialModel;
        this.standardGroupModel = standardGroupModel;
    }
    fetchExcelMaterials() {
        return this.materialModel.findAll({
            include: [{
                    attributes: ["materialId"],
                    model: material_category_model_1.MaterialCategory,
                    include: [{
                            attributes: ['description'],
                            model: categories_model_1.MainCategory
                        }]
                },
                {
                    attributes: ["nickname"],
                    model: material_nickname_model_1.MaterialNickname,
                    required: false
                }],
            where: {
                recordStatus: constants_1.RECORD_STATUS.ACTIVE,
                centerId: constants_1.SUPPLY_CENTERS.AMMO
            }
        });
    }
    fetchMaterialsForExcelImport(materialIds) {
        if (materialIds.length === 0)
            return Promise.resolve([]);
        return this.materialModel.findAll({
            attributes: ["id", "description", "multiply", "recordStatus", "unitOfMeasurement"],
            include: [{
                    attributes: ["nickname"],
                    model: material_nickname_model_1.MaterialNickname,
                    required: false
                }, {
                    attributes: ["materialId"],
                    model: material_category_model_1.MaterialCategory,
                    required: false,
                    include: [{
                            attributes: ["description"],
                            model: categories_model_1.MainCategory,
                            required: false
                        }]
                }],
            where: {
                id: { [sequelize_2.Op.in]: materialIds },
                centerId: constants_1.SUPPLY_CENTERS.AMMO,
                type: constants_1.MATERIAL_TYPES.ITEM
            }
        });
    }
    async fetchBySearch(filter, unitId, tab) {
        const materials = await this.materialModel.findAll({
            include: [{
                    attributes: ["materialId"],
                    model: material_category_model_1.MaterialCategory,
                    include: [{
                            attributes: ['description'],
                            model: categories_model_1.MainCategory
                        }]
                },
                {
                    attributes: ["nickname"],
                    model: material_nickname_model_1.MaterialNickname,
                    required: false
                },
                {
                    attributes: ["materialId"],
                    model: unit_favorite_material_model_1.UnitFavoriteMaterial,
                    where: { unitId },
                    required: false
                }],
            where: {
                [sequelize_2.Op.or]: [
                    { id: { [sequelize_2.Op.iLike]: `%${filter}%` } },
                    { description: { [sequelize_2.Op.iLike]: `%${filter}%` } }
                ],
                recordStatus: constants_1.RECORD_STATUS.ACTIVE,
                type: constants_1.MATERIAL_TYPES.ITEM,
                centerId: constants_1.SUPPLY_CENTERS.AMMO
            },
        });
        const standardGroups = await this.standardGroupModel.findAll({
            include: [{
                    association: "nickname",
                    required: false
                }, {
                    association: "categoryGroup",
                    required: false,
                    include: [{
                            association: "categoryDesc",
                            attributes: ["description"],
                            required: false
                        }]
                }],
            where: {
                [sequelize_2.Op.or]: [
                    { id: { [sequelize_2.Op.iLike]: `%${filter}%` } },
                    { name: { [sequelize_2.Op.iLike]: `%${filter}%` } }
                ],
                groupType: {
                    [sequelize_2.Op.in]: Number(tab) === constants_1.REPORT_TYPES.INVENTORY
                        ? [constants_1.MATERIAL_TYPES.ITEM, constants_1.MATERIAL_TYPES.TOOL]
                        : [constants_1.MATERIAL_TYPES.ITEM]
                }
            }
        });
        const materialIds = materials.map(material => material.id);
        const groupsIds = standardGroups.map(group => group.id);
        const comments = materialIds.length === 0
            ? []
            : await this.commentModel.findAll({
                where: {
                    materialId: { [sequelize_2.Op.in]: [...materialIds, ...groupsIds] },
                    [sequelize_2.Op.or]: [
                        { unitId },
                        { recipientUnitId: unitId }
                    ]
                },
                order: [["date", "DESC"]]
            });
        const favoriteIds = await this.fetchFavoriteIds(unitId);
        return {
            materials,
            comments,
            standardGroups,
            favoriteIds
        };
    }
    async fetchByIds(materialsIds, unitId, tab) {
        const materials = await this.materialModel.findAll({
            include: [{
                    attributes: ["materialId"],
                    model: material_category_model_1.MaterialCategory,
                    include: [{
                            attributes: ['description'],
                            model: categories_model_1.MainCategory
                        }]
                },
                {
                    attributes: ["nickname"],
                    model: material_nickname_model_1.MaterialNickname,
                    required: false
                },
                {
                    attributes: ["materialId"],
                    model: unit_favorite_material_model_1.UnitFavoriteMaterial,
                    where: { unitId },
                    required: false
                }],
            where: {
                id: { [sequelize_2.Op.in]: materialsIds },
                recordStatus: constants_1.RECORD_STATUS.ACTIVE,
                centerId: constants_1.SUPPLY_CENTERS.AMMO
            },
        });
        const standardGroups = await this.standardGroupModel.findAll({
            include: [{
                    association: "nickname",
                    required: false
                }, {
                    association: "categoryGroup",
                    required: false,
                    include: [{
                            association: "categoryDesc",
                            attributes: ["description"],
                            required: false
                        }]
                }],
            where: {
                id: { [sequelize_2.Op.in]: materialsIds },
                groupType: {
                    [sequelize_2.Op.in]: Number(tab) === constants_1.REPORT_TYPES.INVENTORY
                        ? [constants_1.MATERIAL_TYPES.ITEM, constants_1.MATERIAL_TYPES.TOOL]
                        : [constants_1.MATERIAL_TYPES.ITEM]
                }
            }
        });
        const favoriteIds = await this.fetchFavoriteIds(unitId);
        return {
            materials,
            standardGroups,
            favoriteIds
        };
    }
    async fetchFavoriteIds(unitId) {
        const favorites = await this.unitFavoriteMaterialModel.findAll({
            attributes: ["materialId"],
            where: { unitId }
        });
        return new Set(favorites.map((favorite) => favorite.materialId));
    }
};
exports.MaterialRepository = MaterialRepository;
exports.MaterialRepository = MaterialRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(material_model_1.Material)),
    __param(1, (0, sequelize_1.InjectModel)(comment_model_1.Comment)),
    __param(2, (0, sequelize_1.InjectModel)(unit_favorite_material_model_1.UnitFavoriteMaterial)),
    __param(3, (0, sequelize_1.InjectModel)(standard_group_model_1.StandardGroup)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], MaterialRepository);
//# sourceMappingURL=material.repository.js.map