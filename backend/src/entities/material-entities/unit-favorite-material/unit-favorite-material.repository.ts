import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { UnitFavoriteMaterial } from "./unit-favorite-material.model";
import { CreateUnitFavoriteMaterial, DeleteUnitFavoriteMaterial } from "./DTO/dto";

@Injectable()
export class UnitFavoriteMaterialRepository {
    constructor(@InjectModel(UnitFavoriteMaterial) private readonly unitFavoriteMaterialModel: typeof UnitFavoriteMaterial) { }

    async create(unitFavoriteMaterial: CreateUnitFavoriteMaterial) {
        try {
            return await this.unitFavoriteMaterialModel.create(unitFavoriteMaterial);
        } catch (error) {
            console.log(error);
        }
    }

    destroy(unitFavoriteMaterial: DeleteUnitFavoriteMaterial) {
        return this.unitFavoriteMaterialModel.destroy({
            where: { ...unitFavoriteMaterial }
        })
    }
}