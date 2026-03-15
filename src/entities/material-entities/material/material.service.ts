import { Injectable } from "@nestjs/common";
import { MaterialRepository } from "./material.repository";
import { PastedMaterialsDto } from "./material.types";

@Injectable()
export class MaterialService {
    constructor(private readonly repository: MaterialRepository) { }

    async fetchTwenty(filter: string, unitId: number) {
        const { materials, comments } = await this.repository.fetchBySearch(filter, unitId);
        const commentByMaterial = new Map<string, string>();

        for (const comment of comments) {
            if (!commentByMaterial.has(comment.materialId)) {
                commentByMaterial.set(comment.materialId, comment.text ?? "");
            }
        }

        return materials
            .map(material => ({
                ...material.dataValues,
                unitOfMeasure: material.dataValues.unitOfMeasurement,
                multiply: Number(material.dataValues.multiply),
                category: material.materialCategory?.mainCategory?.dataValues.description,
                nickname: material.nickname?.nickname ?? "",
                favorite: (material.unitFavorites ?? []).length > 0,
                comment: commentByMaterial.get(material.id) ?? ""
            }))
            .sort((a, b) => {
                if (a.favorite !== b.favorite) {
                    return a.favorite ? -1 : 1;
                }
                return String(a.id).localeCompare(String(b.id));
            })
            .slice(0, 20);
    }

    async fetchByIds(pastedMaterials: PastedMaterialsDto, screenUnitId: number) {
        const materials = await this.repository.fetchByIds(pastedMaterials.materialsIds, screenUnitId);

        return materials
            .map(material => ({
                ...material.dataValues,
                unitOfMeasure: material.dataValues.unitOfMeasurement,
                multiply: Number(material.dataValues.multiply),
                category: material.materialCategory?.mainCategory?.dataValues.description,
                nickname: material.nickname?.nickname ?? "",
                favorite: (material.unitFavorites ?? []).length > 0,
            }))
            .sort((a, b) => {
                if (a.favorite !== b.favorite) {
                    return a.favorite ? -1 : 1;
                }
                return String(a.id).localeCompare(String(b.id));
            })
    }
}
