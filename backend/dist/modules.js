"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_module_1 = require("./entities/material-entities/material/material.module");
const unit_favorite_material_module_1 = require("./entities/material-entities/unit-favorite-material/unit-favorite-material.module");
const comment_module_1 = require("./entities/report-entities/comment/comment.module");
const excel_module_1 = require("./entities/report-entities/excel/excel.module");
const report_item_module_1 = require("./entities/report-entities/report-item/report-item.module");
const report_module_1 = require("./entities/report-entities/report/report.module");
const standard_tag_module_1 = require("./entities/standard-entities/standard-tag/standard-tag.module");
const standard_values_module_1 = require("./entities/standard-entities/standard-values/standard-values.module");
const standard_module_1 = require("./entities/standard-entities/standard/standard.module");
const tag_group_module_1 = require("./entities/standard-entities/tag-group/tag-group.module");
const unit_standard_tag_module_1 = require("./entities/standard-entities/unit-standard-tag/unit-standard-tag.module");
const unit_hierarchy_module_1 = require("./entities/unit-entities/features/unit-hierarchy/unit-hierarchy.module");
const units_statuses_module_1 = require("./entities/unit-entities/units-statuses/units-statuses.module");
const user_module_1 = require("./entities/unit-entities/users/user.module");
const server_time_module_1 = require("./server-time/server-time.module");
exports.default = [
    material_module_1.MaterialModule,
    unit_favorite_material_module_1.UnitFavoriteMaterialModule,
    unit_hierarchy_module_1.UnitHierarchyModule,
    report_module_1.ReportModule,
    excel_module_1.ExcelModule,
    units_statuses_module_1.UnitStatusModule,
    comment_module_1.CommentModule,
    report_item_module_1.ReportItemModule,
    tag_group_module_1.TagGroupModule,
    standard_tag_module_1.StandardTagModule,
    unit_standard_tag_module_1.UnitStandardTagModule,
    user_module_1.UnitUserModule,
    standard_values_module_1.StandardValuesModule,
    standard_module_1.StandardModule,
    server_time_module_1.ServerTimeModule
];
//# sourceMappingURL=modules.js.map