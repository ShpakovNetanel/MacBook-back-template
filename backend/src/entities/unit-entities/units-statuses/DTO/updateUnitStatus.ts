import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsInt, IsOptional, Min } from "class-validator";

export class UpdateUnitStatus {
    @IsArray()
    @IsInt({ each: true })
    @Type(() => Number)
    @Min(1, { each: true })
    unitsIds: number[];

    @IsInt()
    statusId: number;

    @IsBoolean()
    updateHierarchy: boolean;

    @IsOptional()
    @IsBoolean()
    clearHierarchyStatuses?: boolean;
}
