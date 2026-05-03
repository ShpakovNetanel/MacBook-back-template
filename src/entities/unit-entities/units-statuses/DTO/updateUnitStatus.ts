import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsInt, IsOptional, Min } from "class-validator";

export class UpdateUnitStatus {
    @IsArray()
    @IsInt({ each: true })
    @Type(() => Number)
    @Min(1, { each: true })
    declare unitsIds: number[];

    @IsInt()
    declare statusId: number;

    @IsBoolean()
    declare updateHierarchy: boolean;

    @IsOptional()
    @IsBoolean()
    declare clearHierarchyStatuses?: boolean;
}
