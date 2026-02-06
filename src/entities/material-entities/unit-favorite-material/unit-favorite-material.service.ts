import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { UnitFavoriteMaterial } from "./unit-favorite-material.model";
import { CreateUnitFavoriteMaterial, DeleteUnitFavoriteMaterial } from "./DTO/dto";
import { UnitFavoriteMaterialRepository } from "./unit-favorite-material.repository";

@Injectable()
export class UnitFavoriteMaterialService {
    constructor(private readonly repository: UnitFavoriteMaterialRepository) { }

    create(unitFavoriteMaterial: CreateUnitFavoriteMaterial) {
        return this.repository.create(unitFavoriteMaterial);
    }

    destroy(unitFavoriteMaterial: DeleteUnitFavoriteMaterial) {
        return this.repository.destroy(unitFavoriteMaterial);
    }
}