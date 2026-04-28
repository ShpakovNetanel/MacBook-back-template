"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPLY_CENTERS = exports.UNIT_STATUSES = exports.UNIT_LEVELS = exports.REPORT_TYPES = exports.MESSAGE_TYPES = exports.UNIT_RELATION_TYPES = exports.MATERIAL_TYPES = exports.RECORD_STATUS = exports.ENVIRONMENTS = void 0;
exports.ENVIRONMENTS = {
    NONPROD: 'nonprod',
    LOCALHOST: 'localhost'
};
exports.RECORD_STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
};
exports.MATERIAL_TYPES = {
    ITEM: 'ITEM',
    TOOL: 'TOOL',
};
exports.UNIT_RELATION_TYPES = {
    ZRA: '1'
};
exports.MESSAGE_TYPES = {
    FATAL: 'Fatal',
    FAILURE: 'Failure',
    SUCCESS: 'Success',
    WARNING: 'Warning'
};
exports.REPORT_TYPES = {
    REQUEST: 0,
    INVENTORY: 1,
    USAGE: 2,
    ALLOCATION: 4
};
exports.UNIT_LEVELS = {
    GDUD: 4,
    HATIVA: 3,
    UGDA: 2,
    PIKUD: 1,
    MATKAL: 0
};
exports.UNIT_STATUSES = {
    REQUESTING: 0,
    WAITING_FOR_ALLOCATION: 1,
    ALLOCATING: 2,
    FINISHED: 3
};
exports.SUPPLY_CENTERS = {
    AMMO: 21,
};
//# sourceMappingURL=constants.js.map