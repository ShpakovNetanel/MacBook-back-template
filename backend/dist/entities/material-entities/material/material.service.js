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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialService = void 0;
const common_1 = require("@nestjs/common");
const material_repository_1 = require("./material.repository");
const remeda_1 = require("remeda");
const constants_1 = require("../../../constants");
const getStandardGroupCategory = (group) => group.categoryGroup?.categoryDesc?.description
    ?? (group.groupType === constants_1.MATERIAL_TYPES.ITEM
        ? 'קבוצת מק״טים'
        : group.groupType === constants_1.MATERIAL_TYPES.TOOL
            ? 'קבוצת כלים'
            : '');
let MaterialService = class MaterialService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async fetchExcelMaterials() {
        const materials = await this.repository.fetchExcelMaterials();
        return materials.map(({ dataValues: material, nickname, materialCategory }) => ({
            id: material.id,
            description: material.description,
            unitOfMeasure: material.unitOfMeasurement,
            multiply: material.multiply,
            nickname: nickname?.dataValues.nickname,
            category: materialCategory?.dataValues.mainCategoryId,
            type: constants_1.MATERIAL_TYPES.ITEM
        }));
    }
    async fetchTwenty(filter, unitId, tab) {
        const { materials, comments, standardGroups, favoriteIds } = await this.repository.fetchBySearch(filter, unitId, tab);
        const reportCommentsByMaterial = new Map();
        for (const comment of comments) {
            let commentsByType = reportCommentsByMaterial.get(comment.materialId);
            if (!commentsByType) {
                commentsByType = new Map();
                reportCommentsByMaterial.set(comment.materialId, commentsByType);
            }
            if (!commentsByType.has(comment.type)) {
                commentsByType.set(comment.type, comment.text ?? '');
            }
        }
        const materialResults = materials.map(material => ({
            ...material.dataValues,
            unitOfMeasure: material.dataValues.unitOfMeasurement,
            multiply: Number(material.dataValues.multiply),
            category: material.materialCategory?.mainCategory?.dataValues.description,
            nickname: material.nickname?.nickname ?? "",
            type: constants_1.MATERIAL_TYPES.ITEM,
            favorite: !(0, remeda_1.isEmptyish)(material.unitFavorites ?? []),
            comments: Array.from(reportCommentsByMaterial.get(material.id)?.entries() ?? [])
                .map(([type, comment]) => ({ type, comment }))
                .sort((a, b) => a.type - b.type)
        }));
        const standardGroupResults = standardGroups.map((group) => ({
            id: group.id,
            description: group.name,
            favorite: favoriteIds.has(group.id),
            type: group.groupType,
            category: getStandardGroupCategory(group),
            nickname: group.nickname?.nickname ?? "",
            unitOfMeasure: 'יח',
            multiply: 0,
            comments: Array.from(reportCommentsByMaterial.get(group.id)?.entries() ?? [])
                .map(([type, comment]) => ({ type, comment }))
                .sort((a, b) => a.type - b.type)
        }));
        return [...materialResults, ...standardGroupResults]
            .sort((a, b) => {
            if (a.favorite !== b.favorite) {
                return a.favorite ? -1 : 1;
            }
            return String(a.id).localeCompare(String(b.id));
        })
            .slice(0, 20);
    }
    async fetchByIds(pastedMaterials, screenUnitId, tab) {
        const { materials, standardGroups, favoriteIds } = await this.repository.fetchByIds(pastedMaterials.materialsIds, screenUnitId, tab);
        const materialResults = materials.map(material => ({
            ...material.dataValues,
            unitOfMeasure: material.dataValues.unitOfMeasurement,
            multiply: Number(material.dataValues.multiply),
            category: material.materialCategory?.mainCategory?.dataValues.description,
            nickname: material.nickname?.nickname ?? "",
            type: constants_1.MATERIAL_TYPES.ITEM,
            favorite: !(0, remeda_1.isEmptyish)(material.unitFavorites ?? []),
        }));
        const standardGroupResults = standardGroups.map((group) => ({
            id: group.id,
            description: group.name,
            favorite: favoriteIds.has(group.id),
            type: group.groupType,
            category: getStandardGroupCategory(group),
            nickname: group.nickname?.nickname ?? "",
            unitOfMeasure: null,
            multiply: 0,
        }));
        return [...materialResults, ...standardGroupResults]
            .sort((a, b) => {
            if (a.favorite !== b.favorite) {
                return a.favorite ? -1 : 1;
            }
            return String(a.id).localeCompare(String(b.id));
        });
    }
};
exports.MaterialService = MaterialService;
exports.MaterialService = MaterialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [material_repository_1.MaterialRepository])
], MaterialService);
//# sourceMappingURL=material.service.js.map