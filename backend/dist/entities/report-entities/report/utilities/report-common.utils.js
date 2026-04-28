"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasHierarchyChanged = void 0;
const remeda_1 = require("remeda");
const hasHierarchyChanged = (screenLowerUnits, dbLowerUnits, returnValue) => {
    if (!(0, remeda_1.isDeepEqual)(screenLowerUnits.sort(), dbLowerUnits.sort())) {
        return { message: `היררכיה תחתיך השתנתה`, returnValue, changed: true };
    }
    return { returnValue, changed: false };
};
exports.hasHierarchyChanged = hasHierarchyChanged;
//# sourceMappingURL=report-common.utils.js.map