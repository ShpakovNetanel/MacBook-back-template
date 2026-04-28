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
exports.MaterialStandardGroup = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const material_model_1 = require("../../material-entities/material/material.model");
const standard_group_model_1 = require("../standard-group/standard-group.model");
let MaterialStandardGroup = class MaterialStandardGroup extends sequelize_typescript_1.Model {
};
exports.MaterialStandardGroup = MaterialStandardGroup;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => standard_group_model_1.StandardGroup),
    (0, sequelize_typescript_1.Column)({ field: "group_id", type: sequelize_typescript_1.DataType.STRING(9) }),
    __metadata("design:type", String)
], MaterialStandardGroup.prototype, "groupId", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => material_model_1.Material),
    (0, sequelize_typescript_1.Column)({ field: "material_id", type: sequelize_typescript_1.DataType.STRING(18) }),
    __metadata("design:type", String)
], MaterialStandardGroup.prototype, "materialId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => standard_group_model_1.StandardGroup, { foreignKey: "groupId" }),
    __metadata("design:type", standard_group_model_1.StandardGroup)
], MaterialStandardGroup.prototype, "standardGroup", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => material_model_1.Material, { foreignKey: "materialId" }),
    __metadata("design:type", material_model_1.Material)
], MaterialStandardGroup.prototype, "material", void 0);
exports.MaterialStandardGroup = MaterialStandardGroup = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "material_standard_group", timestamps: false })
], MaterialStandardGroup);
//# sourceMappingURL=material-standard-group.model.js.map