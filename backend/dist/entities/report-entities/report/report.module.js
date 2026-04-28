"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const categories_model_1 = require("../../material-entities/categories/categories.model");
const material_category_model_1 = require("../../material-entities/material-category/material-category.model");
const material_nickname_model_1 = require("../../material-entities/material-nickname/material-nickname.model");
const material_model_1 = require("../../material-entities/material/material.model");
const unit_favorite_material_model_1 = require("../../material-entities/unit-favorite-material/unit-favorite-material.model");
const material_standard_group_model_1 = require("../../standard-entities/material-standard-group/material-standard-group.model");
const category_desc_model_1 = require("../../standard-entities/category-desc/category-desc.model");
const category_group_model_1 = require("../../standard-entities/category-group/category-group.model");
const standard_group_model_1 = require("../../standard-entities/standard-group/standard-group.model");
const unit_hierarchy_module_1 = require("../../unit-entities/features/unit-hierarchy/unit-hierarchy.module");
const unit_relation_model_1 = require("../../unit-entities/unit-relations/unit-relation.model");
const unit_status_type_model_1 = require("../../unit-entities/unit-status-type/unit-status-type.model");
const unit_module_1 = require("../../unit-entities/unit/unit.module");
const unit_model_1 = require("../../unit-entities/unit/unit.model");
const units_statuses_model_1 = require("../../unit-entities/units-statuses/units-statuses.model");
const comment_model_1 = require("../comment/comment.model");
const report_item_model_1 = require("../report-item/report-item.model");
const stock_model_1 = require("../stock/stock.model");
const report_controller_1 = require("./report.controller");
const report_model_1 = require("./report.model");
const report_repository_1 = require("./report.repository");
const report_service_1 = require("./report.service");
let ReportModule = class ReportModule {
};
exports.ReportModule = ReportModule;
exports.ReportModule = ReportModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([
                report_model_1.Report,
                report_item_model_1.ReportItem,
                unit_model_1.Unit,
                unit_relation_model_1.UnitRelation,
                units_statuses_model_1.UnitStatus,
                unit_status_type_model_1.UnitStatusType,
                material_model_1.Material,
                material_nickname_model_1.MaterialNickname,
                material_category_model_1.MaterialCategory,
                categories_model_1.MainCategory,
                material_standard_group_model_1.MaterialStandardGroup,
                category_desc_model_1.CategoryDesc,
                category_group_model_1.CategoryGroup,
                standard_group_model_1.StandardGroup,
                unit_favorite_material_model_1.UnitFavoriteMaterial,
                comment_model_1.Comment,
                stock_model_1.Stock
            ]),
            unit_hierarchy_module_1.UnitHierarchyModule,
            unit_module_1.UnitModule],
        controllers: [report_controller_1.ReportController],
        providers: [report_service_1.ReportService, report_repository_1.ReportRepository],
        exports: [report_service_1.ReportService, report_repository_1.ReportRepository],
    })
], ReportModule);
//# sourceMappingURL=report.module.js.map