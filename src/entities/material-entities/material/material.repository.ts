import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Material } from "./material.model";
import { Op } from "sequelize";
import { MaterialCategory } from "../material-category/material-category.model";
import { MainCategory } from "../categories/categories.model";
import { MATERIAL_TYPES, RECORD_STATUS, REPORT_TYPES, SUPPLY_CENTERS } from "../../../constants";
import { MaterialNickname } from "../material-nickname/material-nickname.model";
import { UnitFavoriteMaterial } from "../unit-favorite-material/unit-favorite-material.model";
import { Comment } from "../../report-entities/comment/comment.model";
import { StandardGroup } from "../../standard-entities/standard-group/standard-group.model";

@Injectable()
export class MaterialRepository {
    constructor(
        @InjectModel(Material) private readonly materialModel: typeof Material,
        @InjectModel(Comment) private readonly commentModel: typeof Comment,
        @InjectModel(UnitFavoriteMaterial) private readonly unitFavoriteMaterialModel: typeof UnitFavoriteMaterial,
        @InjectModel(StandardGroup) private readonly standardGroupModel: typeof StandardGroup
    ) { }

    fetchExcelMaterials() {
        return this.materialModel.findAll({
            include: [{
                attributes: ["materialId"],
                model: MaterialCategory,
                include: [{
                    attributes: ['description'],
                    model: MainCategory
                }]
            },
            {
                attributes: ["nickname"],
                model: MaterialNickname,
                required: false
            }],
            where: {
                recordStatus: RECORD_STATUS.ACTIVE,
                centerId: SUPPLY_CENTERS.AMMO
            }
        })
    }

    fetchMaterialsForExcelImport(materialIds: string[]) {
        if (materialIds.length === 0) return Promise.resolve([]);

        return this.materialModel.findAll({
            attributes: ["id", "description", "multiply", "recordStatus", "unitOfMeasurement"],
            include: [{
                attributes: ["nickname"],
                model: MaterialNickname,
                required: false
            }, {
                attributes: ["materialId"],
                model: MaterialCategory,
                required: false,
                include: [{
                    attributes: ["description"],
                    model: MainCategory,
                    required: false
                }]
            }],
            where: {
                id: { [Op.in]: materialIds },
                centerId: SUPPLY_CENTERS.AMMO,
                type: MATERIAL_TYPES.ITEM || MATERIAL_TYPES.TOOL
            }
        });
    }

    async fetchBySearch(filter: string, unitId: number, tab: number) {
        const materials = await this.materialModel.findAll({
            include: [{
                attributes: ["materialId"],
                model: MaterialCategory,
                include: [{
                    attributes: ['description'],
                    model: MainCategory
                }]
            },
            {
                attributes: ["nickname"],
                model: MaterialNickname,
                required: false
            },
            {
                attributes: ["materialId"],
                model: UnitFavoriteMaterial,
                where: { unitId },
                required: false
            }],
            where: {
                [Op.or]: [
                    { id: { [Op.iLike]: `%${filter}%` } },
                    { description: { [Op.iLike]: `%${filter}%` } }
                ],
                recordStatus: RECORD_STATUS.ACTIVE,
                type: { [Op.or]: [MATERIAL_TYPES.ITEM, MATERIAL_TYPES.TOOL] },
                centerId: SUPPLY_CENTERS.AMMO
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
                [Op.or]: [
                    { id: { [Op.iLike]: `%${filter}%` } },
                    { name: { [Op.iLike]: `%${filter}%` } }
                ],
                groupType: {
                    [Op.in]: Number(tab) === REPORT_TYPES.INVENTORY
                        ? [MATERIAL_TYPES.ITEM, MATERIAL_TYPES.TOOL]
                        : [MATERIAL_TYPES.ITEM]
                }
            }
        });

        const materialIds = materials.map(material => material.id);
        const groupsIds = standardGroups.map(group => group.id);

        const comments = materialIds.length === 0
            ? []
            : await this.commentModel.findAll({
                where: {
                    materialId: { [Op.in]: [...materialIds, ...groupsIds] },
                    [Op.or]: [
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

    async fetchByIds(materialsIds: string[], unitId: number, tab: number) {
        const materials = await this.materialModel.findAll({
            include: [{
                attributes: ["materialId"],
                model: MaterialCategory,
                include: [{
                    attributes: ['description'],
                    model: MainCategory
                }]
            },
            {
                attributes: ["nickname"],
                model: MaterialNickname,
                required: false
            },
            {
                attributes: ["materialId"],
                model: UnitFavoriteMaterial,
                where: { unitId },
                required: false
            }],
            where: {
                id: { [Op.in]: materialsIds },
                recordStatus: RECORD_STATUS.ACTIVE,
                centerId: SUPPLY_CENTERS.AMMO
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
                id: { [Op.in]: materialsIds },
                groupType: {
                    [Op.in]: Number(tab) === REPORT_TYPES.INVENTORY
                        ? [MATERIAL_TYPES.ITEM, MATERIAL_TYPES.TOOL]
                        : [MATERIAL_TYPES.ITEM]
                }
            }
        })
        const favoriteIds = await this.fetchFavoriteIds(unitId);

        return {
            materials,
            standardGroups,
            favoriteIds
        };
    }

    private async fetchFavoriteIds(unitId: number) {
        const favorites = await this.unitFavoriteMaterialModel.findAll({
            attributes: ["materialId"],
            where: { unitId }
        });
        return new Set(favorites.map((favorite) => favorite.materialId));
    }
}
