import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Material } from "./material.model";
import { Op } from "sequelize";
import { MaterialCategory } from "../material-category/material-category.model";
import { MainCategory } from "../categories/categories.model";
import { RECORD_STATUS } from "src/contants";
import { MaterialNickname } from "../material-nickname/material-nickname.model";
import { UnitFavoriteMaterial } from "../unit-favorite-material/unit-favorite-material.model";
import { Comment } from "src/entities/report-entities/comment/comment.model";

@Injectable()
export class MaterialRepository {
    constructor(
        @InjectModel(Material) private readonly materialModel: typeof Material,
        @InjectModel(Comment) private readonly commentModel: typeof Comment
    ) { }

    async fetchAll(filter: string, unitId: number) {
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
                recordStatus: RECORD_STATUS.ACTIVE
            },
        });

        const materialIds = materials.map(material => material.id);
        const comments = materialIds.length === 0
            ? []
            : await this.commentModel.findAll({
                where: {
                    materialId: { [Op.in]: materialIds },
                    [Op.or]: [
                        { unitId },
                        { recipientUnitId: unitId }
                    ]
                },
                order: [["date", "DESC"]]
            });

        return { materials, comments };
    }
}
