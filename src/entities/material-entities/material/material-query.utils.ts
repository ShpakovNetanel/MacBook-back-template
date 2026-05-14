import { Op, WhereOptions } from "sequelize";
import { MATERIAL_TYPES, SUPPLY_CENTERS } from "../../../constants";
import { IMaterial } from "./material.model";

export const getMaterialSupplyCenterTypeWhere = (): WhereOptions<IMaterial> => ({
    [Op.or]: [
        {
            centerId: SUPPLY_CENTERS.TIKSHUV,
            type: MATERIAL_TYPES.TOOL
        },
        {
            centerId: SUPPLY_CENTERS.AMMO,
            type: MATERIAL_TYPES.ITEM
        }
    ]
});
