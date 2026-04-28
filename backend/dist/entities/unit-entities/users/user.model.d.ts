import { Model } from "sequelize-typescript";
export type IUser = {
    id: string;
    unitId: number;
    name: string;
};
export declare class User extends Model<IUser> {
    id: string;
    unitId: number;
    name: string;
}
