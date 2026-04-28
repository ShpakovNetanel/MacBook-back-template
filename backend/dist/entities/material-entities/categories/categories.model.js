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
exports.SecondCategory = exports.SubCategory = exports.MainCategory = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const material_category_model_1 = require("../material-category/material-category.model");
let MainCategory = class MainCategory extends sequelize_typescript_1.Model {
};
exports.MainCategory = MainCategory;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(3)),
    __metadata("design:type", String)
], MainCategory.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(40)),
    __metadata("design:type", Object)
], MainCategory.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => material_category_model_1.MaterialCategory),
    __metadata("design:type", Array)
], MainCategory.prototype, "materialCategories", void 0);
exports.MainCategory = MainCategory = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "main_categories", timestamps: false })
], MainCategory);
let SubCategory = class SubCategory extends sequelize_typescript_1.Model {
};
exports.SubCategory = SubCategory;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(3)),
    __metadata("design:type", String)
], SubCategory.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(40)),
    __metadata("design:type", Object)
], SubCategory.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => material_category_model_1.MaterialCategory),
    __metadata("design:type", Array)
], SubCategory.prototype, "materialCategories", void 0);
exports.SubCategory = SubCategory = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "sub_categories", timestamps: false })
], SubCategory);
let SecondCategory = class SecondCategory extends sequelize_typescript_1.Model {
};
exports.SecondCategory = SecondCategory;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(3)),
    __metadata("design:type", String)
], SecondCategory.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(40)),
    __metadata("design:type", Object)
], SecondCategory.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => material_category_model_1.MaterialCategory),
    __metadata("design:type", Array)
], SecondCategory.prototype, "materialCategories", void 0);
exports.SecondCategory = SecondCategory = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "second_categories", timestamps: false })
], SecondCategory);
//# sourceMappingURL=categories.model.js.map