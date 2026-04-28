import { Model } from "sequelize-typescript";
import { UnitId } from "../unit-id/unit-id.model";
export type IUnitRelation = {
    unitId: number;
    relatedUnitId: number;
    unitRelationId: string;
    unitObjectType: string;
    relatedUnitObjectType: string;
    startDate: Date;
    endDate: Date;
};
export declare class UnitRelation extends Model<IUnitRelation> {
    unitId: number;
    relatedUnitId: number;
    unitRelationId: string;
    unitObjectType: string;
    relatedUnitObjectType: string;
    startDate: Date;
    endDate: Date;
    unit?: UnitId;
    relatedUnit?: UnitId;
}
