import { IsDate, IsNumber, IsString } from "class-validator";

export class CommentDTO {
    @IsNumber()
    unitId: number;

    @IsString()
    materialId: string;

    @IsDate()
    date: Date;

    @IsNumber()
    type: number;

    @IsNumber()
    recipientUnitId: number;

    @IsString()
    text?: string | null;
}