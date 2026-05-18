import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Material } from "./material.model";
import { Op } from "sequelize";
import { MaterialCategory } from "../material-category/material-category.model";
import { MainCategory } from "../categories/categories.model";
import { MATERIAL_TYPES, RECORD_STATUS, REPORT_TYPES } from "../../../constants";
import { MaterialNickname } from "../material-nickname/material-nickname.model";
import { UnitFavoriteMaterial } from "../unit-favorite-material/unit-favorite-material.model";
import { Comment } from "../../report-entities/comment/comment.model";
import { StandardGroup } from "../../standard-entities/standard-group/standard-group.model";
import { MaterialStandardGroup } from "../../standard-entities/material-standard-group/material-standard-group.model";
import { CategoryDesc } from "src/entities/standard-entities/category-desc/category-desc.model";
import { CategoryGroup } from "src/entities/standard-entities/category-group/category-group.model";
import { getMaterialSupplyCenterTypeWhere } from "./material-query.utils";

const getMaterialTypesForTab = (tab?: number) => Number(tab) === REPORT_TYPES.INVENTORY
    ? [MATERIAL_TYPES.ITEM, MATERIAL_TYPES.TOOL]
    : [MATERIAL_TYPES.ITEM];

const getMaterialStandardGroupInclude = () => ({
    attributes: ["groupId", "materialId"],
    model: MaterialStandardGroup,
    as: "standardGroupMaterials",
    required: false,
    separate: true,
    include: [{
        attributes: ["id", "name", "groupType"],
        model: StandardGroup,
        required: false,
        include: [{
            attributes: ["id"],
            model: CategoryGroup,
            required: false,
            include: [{
                attributes: ["id", "description"],
                model: CategoryDesc,
                required: false
            }]
        }]
    }]
});

@Injectable()
export class MaterialRepository {
    constructor(
        @InjectModel(Material) private readonly materialModel: typeof Material,
        @InjectModel(Comment) private readonly commentModel: typeof Comment,
        @InjectModel(UnitFavoriteMaterial) private readonly unitFavoriteMaterialModel: typeof UnitFavoriteMaterial,
        @InjectModel(StandardGroup) private readonly standardGroupModel: typeof StandardGroup
    ) { }

    async fetchExcelMaterials() {
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
            getMaterialStandardGroupInclude()],
            where: {
                recordStatus: RECORD_STATUS.ACTIVE,
                ...getMaterialSupplyCenterTypeWhere()
            }
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
                    attributes: ["id", "description"],
                    required: false
                }]
            }],
            where: {
                groupType: MATERIAL_TYPES.ITEM
            }
        });

        return { materials, standardGroups };
    }

    fetchMaterialsForExcelImport(materialIds: string[]) {
        if (materialIds.length === 0) return Promise.resolve([]);

        return this.materialModel.findAll({
            attributes: ["id", "description", "multiply", "recordStatus", "unitOfMeasurement", "type"],
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
            },
            getMaterialStandardGroupInclude()],
            where: {
                id: { [Op.in]: materialIds },
                ...getMaterialSupplyCenterTypeWhere()
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
            },
            getMaterialStandardGroupInclude()],
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { id: { [Op.iLike]: `%${filter}%` } },
                            { description: { [Op.iLike]: `%${filter}%` } }
                        ],
                    },
                    getMaterialSupplyCenterTypeWhere(tab)
                ],
                recordStatus: RECORD_STATUS.ACTIVE,
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
                    attributes: ["id", "description"],
                    required: false
                }]
            }],
            where: {
                [Op.or]: [
                    { id: { [Op.iLike]: `%${filter}%` } },
                    { name: { [Op.iLike]: `%${filter}%` } }
                ],
                groupType: {
                    [Op.in]: getMaterialTypesForTab(tab)
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
            },
            getMaterialStandardGroupInclude()],
            where: {
                id: { [Op.in]: materialsIds },
                recordStatus: RECORD_STATUS.ACTIVE,
                ...getMaterialSupplyCenterTypeWhere(tab)
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
                    attributes: ["id", "description"],
                    required: false
                }]
            }],
            where: {
                id: { [Op.in]: materialsIds },
                groupType: {
                    [Op.in]: getMaterialTypesForTab(tab)
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
