import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { UnitFavoriteMaterial } from "./unit-favorite-material.model";
import { CreateUnitFavoriteMaterial, DeleteUnitFavoriteMaterial } from "./DTO/dto";

@Injectable()
export class UnitFavoriteMaterialRepository {
    constructor(@InjectModel(UnitFavoriteMaterial) private readonly unitFavoriteMaterialModel: typeof UnitFavoriteMaterial) { }

    create(unitFavoriteMaterial: CreateUnitFavoriteMaterial) {
        return this.unitFavoriteMaterialModel.create(unitFavoriteMaterial);
    }

    destroy(unitFavoriteMaterial: DeleteUnitFavoriteMaterial) {
        return this.unitFavoriteMaterialModel.destroy({
            where: { ...unitFavoriteMaterial }
        })
    }
}