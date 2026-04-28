import { Material } from "./material.model";
import { UnitFavoriteMaterial } from "../unit-favorite-material/unit-favorite-material.model";
import { Comment } from "../../report-entities/comment/comment.model";
import { StandardGroup } from "../../standard-entities/standard-group/standard-group.model";
export declare class MaterialRepository {
    private readonly materialModel;
    private readonly commentModel;
    private readonly unitFavoriteMaterialModel;
    private readonly standardGroupModel;
    constructor(materialModel: typeof Material, commentModel: typeof Comment, unitFavoriteMaterialModel: typeof UnitFavoriteMaterial, standardGroupModel: typeof StandardGroup);
    fetchExcelMaterials(): Promise<Material[]>;
    fetchMaterialsForExcelImport(materialIds: string[]): Promise<Material[]>;
    fetchBySearch(filter: string, unitId: number, tab: number): Promise<{
        materials: Material[];
        comments: Comment[];
        standardGroups: StandardGroup[];
        favoriteIds: Set<string>;
    }>;
    fetchByIds(materialsIds: string[], unitId: number, tab: number): Promise<{
        materials: Material[];
        standardGroups: StandardGroup[];
        favoriteIds: Set<string>;
    }>;
    private fetchFavoriteIds;
}
