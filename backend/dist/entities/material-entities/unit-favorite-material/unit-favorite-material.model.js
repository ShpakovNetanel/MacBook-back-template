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
exports.UnitFavoriteMaterial = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const material_model_1 = require("../material/material.model");
const unit_id_model_1 = require("../../unit-entities/unit-id/unit-id.model");
let UnitFavoriteMaterial = class UnitFavoriteMaterial extends sequelize_typescript_1.Model {
};
exports.UnitFavoriteMaterial = UnitFavoriteMaterial;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => unit_id_model_1.UnitId),
    (0, sequelize_typescript_1.Column)({ field: "unit_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], UnitFavoriteMaterial.prototype, "unitId", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({ field: "material_id", type: sequelize_typescript_1.DataType.STRING(18) }),
    __metadata("design:type", String)
], UnitFavoriteMaterial.prototype, "materialId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => unit_id_model_1.UnitId),
    __metadata("design:type", unit_id_model_1.UnitId)
], UnitFavoriteMaterial.prototype, "unit", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => material_model_1.Material, { foreignKey: "materialId", targetKey: "id", constraints: false }),
    __metadata("design:type", material_model_1.Material)
], UnitFavoriteMaterial.prototype, "material", void 0);
exports.UnitFavoriteMaterial = UnitFavoriteMaterial = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "units_favorite_materials", timestamps: false })
], UnitFavoriteMaterial);
//# sourceMappingURL=unit-favorite-material.model.js.map