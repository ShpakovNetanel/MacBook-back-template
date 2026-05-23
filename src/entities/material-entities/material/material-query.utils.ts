import { literal, Op, WhereOptions } from "sequelize";
import { MATERIAL_TYPES, RECORD_STATUS, REPORT_TYPES, SUPPLY_CENTERS } from "../../../constants";
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

export const getActiveToolStandardGroupConstraint = (materialAlias = "Material") =>
    literal(`(
        "${materialAlias}"."type" <> '${MATERIAL_TYPES.TOOL}'
        OR EXISTS (
            SELECT 1
            FROM material_standard_group AS msg
            INNER JOIN standard_groups AS sg ON sg.id = msg.group_id
            WHERE msg.material_id = "${materialAlias}"."id"
              AND sg.status = '${RECORD_STATUS.ACTIVE}'
        )
    )`);
