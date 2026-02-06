import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Material } from "./material.model";
import { Op } from "sequelize";
import { MaterialCategory } from "../material-category/material-category.model";
import { MainCategory } from "../categories/categories.model";
import { RECORD_STATUS } from "src/contants";

@Injectable()
export class MaterialRepository {
    constructor(@InjectModel(Material) private readonly materialModel: typeof Material) { }

    fetchAll(filter: string) {
        return this.materialModel.findAll({
            include: [{
                attributes: ["materialId"],
                model: MaterialCategory,
                include: [{
                    attributes: ['description'],
                    model: MainCategory
                }]
            }],
            where: {
                [Op.or]: [
                    { id: { [Op.iLike]: `%${filter}%` } },
                    { description: { [Op.iLike]: `%${filter}%` } }
                ],
                recordStatus: RECORD_STATUS.ACTIVE
            },
        })
    }
}
