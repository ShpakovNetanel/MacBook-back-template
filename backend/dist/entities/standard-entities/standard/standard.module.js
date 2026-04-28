"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const report_module_1 = require("../../report-entities/report/report.module");
const unit_hierarchy_module_1 = require("../../unit-entities/features/unit-hierarchy/unit-hierarchy.module");
const standard_attribute_model_1 = require("../standard-attribute/standard-attribute.model");
const standard_controller_1 = require("./standard.controller");
const standard_repository_1 = require("./standard.repository");
const standard_service_1 = require("./standard.service");
const units_statuses_model_1 = require("../../unit-entities/units-statuses/units-statuses.model");
const material_model_1 = require("../../material-entities/material/material.model");
const unit_model_1 = require("../../unit-entities/unit/unit.model");
const category_desc_model_1 = require("../category-desc/category-desc.model");
const category_group_model_1 = require("../category-group/category-group.model");
const standard_group_model_1 = require("../standard-group/standard-group.model");
const material_standard_group_model_1 = require("../material-standard-group/material-standard-group.model");
const tag_group_model_1 = require("../tag-group/tag-group.model");
const standard_tag_model_1 = require("../standard-tag/standard-tag.model");
const unit_standard_tag_model_1 = require("../unit-standard-tag/unit-standard-tag.model");
const standard_values_model_1 = require("../standard-values/standard-values.model");
let StandardModule = class StandardModule {
};
exports.StandardModule = StandardModule;
exports.StandardModule = StandardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([
                category_desc_model_1.CategoryDesc,
                category_group_model_1.CategoryGroup,
                standard_group_model_1.StandardGroup,
                material_standard_group_model_1.MaterialStandardGroup,
                tag_group_model_1.TagGroup,
                standard_tag_model_1.StandardTag,
                unit_standard_tag_model_1.UnitStandardTags,
                standard_attribute_model_1.StandardAttribute,
                standard_values_model_1.StandardValues,
                units_statuses_model_1.UnitStatus,
                material_model_1.Material,
                unit_model_1.Unit,
            ]),
            report_module_1.ReportModule,
            unit_hierarchy_module_1.UnitHierarchyModule,
        ],
        controllers: [standard_controller_1.StandardController],
        providers: [standard_service_1.StandardService, standard_repository_1.StandardRepository],
        exports: [standard_service_1.StandardService],
    })
], StandardModule);
//# sourceMappingURL=standard.module.js.map