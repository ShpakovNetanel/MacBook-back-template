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
exports.StandardGroup = void 0;
const sequelize_1 = require("sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const material_nickname_model_1 = require("../../material-entities/material-nickname/material-nickname.model");
const category_group_model_1 = require("../category-group/category-group.model");
let StandardGroup = class StandardGroup extends sequelize_typescript_1.Model {
};
exports.StandardGroup = StandardGroup;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_1.DataTypes.STRING),
    __metadata("design:type", String)
], StandardGroup.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_1.DataTypes.STRING),
    __metadata("design:type", String)
], StandardGroup.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "group_type", type: sequelize_1.DataTypes.STRING }),
    __metadata("design:type", String)
], StandardGroup.prototype, "groupType", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => material_nickname_model_1.MaterialNickname, { foreignKey: "materialId", sourceKey: "id", constraints: false, as: "nickname" }),
    __metadata("design:type", material_nickname_model_1.MaterialNickname)
], StandardGroup.prototype, "nickname", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => category_group_model_1.CategoryGroup, { foreignKey: "id", targetKey: "groupId", constraints: false, as: "categoryGroup" }),
    __metadata("design:type", category_group_model_1.CategoryGroup)
], StandardGroup.prototype, "categoryGroup", void 0);
exports.StandardGroup = StandardGroup = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'standard_groups', timestamps: false })
], StandardGroup);
//# sourceMappingURL=standard-group.model.js.map