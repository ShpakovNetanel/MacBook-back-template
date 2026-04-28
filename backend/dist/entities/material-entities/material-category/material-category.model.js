"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialCategory = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const material_model_1 = require("../material/material.model");
const categories_model_1 = require("../categories/categories.model");
let MaterialCategory = class MaterialCategory extends sequelize_typescript_1.Model {
};
exports.MaterialCategory = MaterialCategory;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => material_model_1.Material),
    (0, sequelize_typescript_1.Column)({ field: "material_id", type: sequelize_typescript_1.DataType.STRING(18) }),
    __metadata("design:type", String)
], MaterialCategory.prototype, "materialId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => categories_model_1.MainCategory),
    (0, sequelize_typescript_1.Column)({ field: "main_category", type: sequelize_typescript_1.DataType.STRING(3) }),
    __metadata("design:type", Object)
], MaterialCategory.prototype, "mainCategoryId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => categories_model_1.SubCategory),
    (0, sequelize_typescript_1.Column)({ field: "sub_category", type: sequelize_typescript_1.DataType.STRING(3) }),
    __metadata("design:type", Object)
], MaterialCategory.prototype, "subCategoryId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => categories_model_1.SecondCategory),
    (0, sequelize_typescript_1.Column)({ field: "second_category", type: sequelize_typescript_1.DataType.STRING(3) }),
    __metadata("design:type", Object)
], MaterialCategory.prototype, "secondCategoryId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => material_model_1.Material),
    __metadata("design:type", material_model_1.Material)
], MaterialCategory.prototype, "material", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => categories_model_1.MainCategory),
    __metadata("design:type", categories_model_1.MainCategory)
], MaterialCategory.prototype, "mainCategory", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => categories_model_1.SubCategory),
    __metadata("design:type", categories_model_1.SubCategory)
], MaterialCategory.prototype, "subCategory", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => categories_model_1.SecondCategory),
    __metadata("design:type", categories_model_1.SecondCategory)
], MaterialCategory.prototype, "secondCategory", void 0);
exports.MaterialCategory = MaterialCategory = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "material_categories", timestamps: false })
], MaterialCategory);
//# sourceMappingURL=material-category.model.js.map