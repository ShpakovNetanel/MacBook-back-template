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
exports.UnitStandardTags = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const unit_id_model_1 = require("../../unit-entities/unit-id/unit-id.model");
const standard_tag_model_1 = require("../standard-tag/standard-tag.model");
let UnitStandardTags = class UnitStandardTags extends sequelize_typescript_1.Model {
};
exports.UnitStandardTags = UnitStandardTags;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => standard_tag_model_1.StandardTag),
    (0, sequelize_typescript_1.Column)({ field: 'tag_id', type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], UnitStandardTags.prototype, "tagId", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => unit_id_model_1.UnitId),
    (0, sequelize_typescript_1.Column)({ field: 'unit_id', type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], UnitStandardTags.prototype, "unitId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => unit_id_model_1.UnitId),
    __metadata("design:type", unit_id_model_1.UnitId)
], UnitStandardTags.prototype, "Unit", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => standard_tag_model_1.StandardTag),
    __metadata("design:type", standard_tag_model_1.StandardTag)
], UnitStandardTags.prototype, "tag", void 0);
exports.UnitStandardTags = UnitStandardTags = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'unit_standard_tags', timestamps: false })
], UnitStandardTags);
//# sourceMappingURL=unit-standard-tag.model.js.map