import { Model } from "sequelize-typescript";
import { UnitId } from "src/entities/unit-entities/unit-id/unit-id.model";
import { StandardGroup } from "../standard-group/standard-group.model";
import { StandardValues } from "../standard-values/standard-values.model";
export type IStandardAttribute = {
    id: number;
    managingUnit: number;
    itemGroupId: string;
    toolGroupId: string | null;
};
export declare class StandardAttribute extends Model<IStandardAttribute> {
    id: number;
    managingUnit: number;
    itemGroupId: string;
    toolGroupId: string | null;
    managingUnitDetails?: UnitId;
    itemGroup?: StandardGroup;
    toolGroup?: StandardGroup;
    values?: StandardValues[];
}
