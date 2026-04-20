import { Injectable } from "@nestjs/common";
import { MaterialRepository } from "./material.repository";
import { PastedMaterialsDto } from "./material.types";
import { isEmptyish } from "remeda";
import { MATERIAL_TYPES } from "../../../constants";

@Injectable()
export class MaterialService {
    constructor(private readonly repository: MaterialRepository) { }

    async fetchExcelMaterials() {
        const materials = await this.repository.fetchExcelMaterials();

        return materials.map(({ dataValues: material, nickname, materialCategory }) => ({
            id: material.id,
            description: material.description,
            unitOfMeasure: material.unitOfMeasurement,
            multiply: material.multiply,
            nickname: nickname?.dataValues.nickname,
            category: materialCategory?.dataValues.mainCategoryId,
            type: MATERIAL_TYPES.ITEM
        }))
    }

    async fetchTwenty(filter: string, unitId: number, tab: number) {
        const { materials, comments, standardGroups, favoriteIds } = await this.repository.fetchBySearch(filter, unitId, tab);
        const commentByMaterial = new Map<string, any>();

        for (const comment of comments) {
            if (!commentByMaterial.has(comment.materialId)) {
                commentByMaterial.set(comment.materialId, {
                    type: comment.dataValues.type,
                    comment: comment.dataValues.text
                });
            }
        }

        const materialResults = materials.map(material => ({
            ...material.dataValues,
            unitOfMeasure: material.dataValues.unitOfMeasurement,
            multiply: Number(material.dataValues.multiply),
            category: material.materialCategory?.mainCategory?.dataValues.description,
            nickname: material.nickname?.nickname ?? "",
            type: MATERIAL_TYPES.ITEM,
            favorite: !isEmptyish(material.unitFavorites ?? []),
            comment: commentByMaterial.get(material.id) ?? null
        }));
        const standardGroupResults: Array<Record<string, any>> = standardGroups.map((group) => ({
            id: group.id,
            description: group.name,
            favorite: favoriteIds.has(group.id),
            type: group.groupType,
            category: group.groupType === MATERIAL_TYPES.ITEM
                ? 'קבוצת מק״טים'
                : group.groupType === MATERIAL_TYPES.TOOL
                    ? 'קבוצת כלים' : '',
            nickname: group.nickname?.nickname ?? "",
            unitOfMeasure: 'יח',
            multiply: 0,
            comment: null
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

    async fetchByIds(pastedMaterials: PastedMaterialsDto, screenUnitId: number, tab: number) {
        const { materials, standardGroups, favoriteIds } = await this.repository.fetchByIds(
            pastedMaterials.materialsIds,
            screenUnitId,
            tab
        );

        const materialResults = materials.map(material => ({
            ...material.dataValues,
            unitOfMeasure: material.dataValues.unitOfMeasurement,
            multiply: Number(material.dataValues.multiply),
            category: material.materialCategory?.mainCategory?.dataValues.description,
            nickname: material.nickname?.nickname ?? "",
            type: MATERIAL_TYPES.ITEM,
            favorite: !isEmptyish(material.unitFavorites ?? []),
        }));
        const standardGroupResults: Array<Record<string, any>> = standardGroups.map((group) => ({
            id: group.id,
            description: group.name,
            favorite: favoriteIds.has(group.id),
            type: MATERIAL_TYPES.TOOL,
            category: 'קבוצה',
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
            })
    }
}
