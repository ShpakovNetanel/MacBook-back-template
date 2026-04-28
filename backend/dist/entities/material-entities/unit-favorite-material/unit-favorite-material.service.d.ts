import { CreateUnitFavoriteMaterial, DeleteUnitFavoriteMaterial } from "./DTO/dto";
import { UnitFavoriteMaterialRepository } from "./unit-favorite-material.repository";
export declare class UnitFavoriteMaterialService {
    private readonly repository;
    constructor(repository: UnitFavoriteMaterialRepository);
    create(unitFavoriteMaterial: CreateUnitFavoriteMaterial): Promise<import("./unit-favorite-material.model").UnitFavoriteMaterial | undefined>;
    destroy(unitFavoriteMaterial: DeleteUnitFavoriteMaterial): Promise<{
        data: {
            deletedCount: number;
        };
    }>;
}
