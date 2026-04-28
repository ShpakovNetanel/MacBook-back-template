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
exports.CategoryGroup = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const category_desc_model_1 = require("../category-desc/category-desc.model");
let CategoryGroup = class CategoryGroup extends sequelize_typescript_1.Model {
};
exports.CategoryGroup = CategoryGroup;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => category_desc_model_1.CategoryDesc),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING }),
    __metadata("design:type", String)
], CategoryGroup.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, field: 'group_id' }),
    __metadata("design:type", String)
], CategoryGroup.prototype, "groupId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => category_desc_model_1.CategoryDesc, { foreignKey: "id", targetKey: "id", constraints: false, as: "categoryDesc" }),
    __metadata("design:type", category_desc_model_1.CategoryDesc)
], CategoryGroup.prototype, "categoryDesc", void 0);
exports.CategoryGroup = CategoryGroup = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'category_groups',
        timestamps: false,
    })
], CategoryGroup);
//# sourceMappingURL=category-group.model.js.map