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
exports.CategoryDesc = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const category_group_model_1 = require("../category-group/category-group.model");
let CategoryDesc = class CategoryDesc extends sequelize_typescript_1.Model {
};
exports.CategoryDesc = CategoryDesc;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING }),
    __metadata("design:type", String)
], CategoryDesc.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING }),
    __metadata("design:type", String)
], CategoryDesc.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, field: 'category_type' }),
    __metadata("design:type", String)
], CategoryDesc.prototype, "categoryType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, field: 'is_against_tool' }),
    __metadata("design:type", Boolean)
], CategoryDesc.prototype, "isAgainstTool", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => category_group_model_1.CategoryGroup),
    __metadata("design:type", Array)
], CategoryDesc.prototype, "categoryGroups", void 0);
exports.CategoryDesc = CategoryDesc = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'category_desc', timestamps: false })
], CategoryDesc);
//# sourceMappingURL=category-desc.model.js.map