import { CreateUnitFavoriteMaterial, DeleteUnitFavoriteMaterial } from "./DTO/dto";
import { UnitFavoriteMaterialService } from "./unit-favorite-material.service";
export declare class UnitFavoriteMaterialController {
    private readonly service;
    constructor(service: UnitFavoriteMaterialService);
    createUnitFavoriteMaterial(unitFavoriteMaterial: CreateUnitFavoriteMaterial): Promise<import("./unit-favorite-material.model").UnitFavoriteMaterial | undefined>;
    deleteUnitFavoriteMaterial(unitFavoriteMaterial: DeleteUnitFavoriteMaterial): Promise<{
        data: {
            deletedCount: number;
        };
    }>;
}
