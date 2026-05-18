import { Op, WhereOptions } from "sequelize";
import { MATERIAL_TYPES, REPORT_TYPES, SUPPLY_CENTERS } from "../../../constants";
import { IMaterial } from "./material.model";

export const getMaterialSupplyCenterTypeWhere = (tab?: number): WhereOptions<IMaterial> => {
    const supplyCenterTypeWhere = [
        {
            centerId: SUPPLY_CENTERS.AMMO,
            type: MATERIAL_TYPES.ITEM
        }
    ];

    if (Number(tab) === REPORT_TYPES.INVENTORY) {
        supplyCenterTypeWhere.push({
            centerId: SUPPLY_CENTERS.TIKSHUV,
            type: MATERIAL_TYPES.TOOL
        });
    }

    return {
        [Op.or]: supplyCenterTypeWhere
    };
};
