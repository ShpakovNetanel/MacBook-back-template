import { Type } from "class-transformer";
import { IsInt, IsString, Length, Min } from "class-validator";

export class CreateUnitFavoriteMaterial {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    unitId: number;

    @IsString()
    @Length(1, 18)
    materialId: string;
}

export class DeleteUnitFavoriteMaterial {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    unitId: number;

    @IsString()
    @Length(1, 18)
    materialId: string;
}