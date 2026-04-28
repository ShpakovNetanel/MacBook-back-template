"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const material_controller_1 = require("./material.controller");
const material_service_1 = require("./material.service");
const material_repository_1 = require("./material.repository");
const material_model_1 = require("./material.model");
const material_category_model_1 = require("../material-category/material-category.model");
const material_nickname_model_1 = require("../material-nickname/material-nickname.model");
const unit_favorite_material_model_1 = require("../unit-favorite-material/unit-favorite-material.model");
const categories_model_1 = require("../categories/categories.model");
const comment_model_1 = require("../../report-entities/comment/comment.model");
const report_model_1 = require("../../report-entities/report/report.model");
const report_item_model_1 = require("../../report-entities/report-item/report-item.model");
const stock_model_1 = require("../../report-entities/stock/stock.model");
const category_desc_model_1 = require("../../standard-entities/category-desc/category-desc.model");
const category_group_model_1 = require("../../standard-entities/category-group/category-group.model");
const standard_group_model_1 = require("../../standard-entities/standard-group/standard-group.model");
const unit_id_model_1 = require("../../unit-entities/unit-id/unit-id.model");
const unit_model_1 = require("../../unit-entities/unit/unit.model");
let MaterialModule = class MaterialModule {
};
exports.MaterialModule = MaterialModule;
exports.MaterialModule = MaterialModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([
                comment_model_1.Comment,
                categories_model_1.MainCategory,
                material_model_1.Material,
                material_category_model_1.MaterialCategory,
                material_nickname_model_1.MaterialNickname,
                report_model_1.Report,
                report_item_model_1.ReportItem,
                categories_model_1.SecondCategory,
                stock_model_1.Stock,
                category_desc_model_1.CategoryDesc,
                category_group_model_1.CategoryGroup,
                standard_group_model_1.StandardGroup,
                categories_model_1.SubCategory,
                unit_id_model_1.UnitId,
                unit_model_1.Unit,
                unit_favorite_material_model_1.UnitFavoriteMaterial,
            ]),
        ],
        controllers: [material_controller_1.MaterialController],
        providers: [material_service_1.MaterialService, material_repository_1.MaterialRepository],
        exports: [material_repository_1.MaterialRepository]
    })
], MaterialModule);
//# sourceMappingURL=material.module.js.map