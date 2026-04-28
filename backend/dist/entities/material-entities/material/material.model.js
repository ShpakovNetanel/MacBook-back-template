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
exports.Material = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const comment_model_1 = require("../../report-entities/comment/comment.model");
const report_item_model_1 = require("../../report-entities/report-item/report-item.model");
const stock_model_1 = require("../../report-entities/stock/stock.model");
const material_category_model_1 = require("../material-category/material-category.model");
const material_nickname_model_1 = require("../material-nickname/material-nickname.model");
const unit_favorite_material_model_1 = require("../unit-favorite-material/unit-favorite-material.model");
let Material = class Material extends sequelize_typescript_1.Model {
};
exports.Material = Material;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(18)),
    __metadata("design:type", String)
], Material.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(40)),
    __metadata("design:type", Object)
], Material.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "center_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], Material.prototype, "centerId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "section_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], Material.prototype, "sectionId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "unit_of_measurement", type: sequelize_typescript_1.DataType.STRING(40) }),
    __metadata("design:type", Object)
], Material.prototype, "unitOfMeasurement", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL),
    __metadata("design:type", Object)
], Material.prototype, "multiply", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "record_status", type: sequelize_typescript_1.DataType.STRING(20) }),
    __metadata("design:type", String)
], Material.prototype, "recordStatus", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(20)),
    __metadata("design:type", String)
], Material.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => material_category_model_1.MaterialCategory),
    __metadata("design:type", material_category_model_1.MaterialCategory)
], Material.prototype, "materialCategory", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => unit_favorite_material_model_1.UnitFavoriteMaterial, { foreignKey: "materialId", sourceKey: "id", constraints: false }),
    __metadata("design:type", Array)
], Material.prototype, "unitFavorites", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => stock_model_1.Stock),
    __metadata("design:type", Array)
], Material.prototype, "stocks", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => comment_model_1.Comment),
    __metadata("design:type", Array)
], Material.prototype, "comments", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => material_nickname_model_1.MaterialNickname),
    __metadata("design:type", material_nickname_model_1.MaterialNickname)
], Material.prototype, "nickname", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => report_item_model_1.ReportItem),
    __metadata("design:type", Array)
], Material.prototype, "reportItems", void 0);
exports.Material = Material = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "materials", timestamps: false })
], Material);
//# sourceMappingURL=material.model.js.map