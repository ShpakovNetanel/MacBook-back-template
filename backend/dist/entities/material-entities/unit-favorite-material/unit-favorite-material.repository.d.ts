import { UnitFavoriteMaterial } from "./unit-favorite-material.model";
import { CreateUnitFavoriteMaterial, DeleteUnitFavoriteMaterial } from "./DTO/dto";
export declare class UnitFavoriteMaterialRepository {
    private readonly unitFavoriteMaterialModel;
    constructor(unitFavoriteMaterialModel: typeof UnitFavoriteMaterial);
    create(unitFavoriteMaterial: CreateUnitFavoriteMaterial): Promise<UnitFavoriteMaterial | undefined>;
    destroy(unitFavoriteMaterial: DeleteUnitFavoriteMaterial): Promise<number>;
}
