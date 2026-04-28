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
exports.StandardValues = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const standard_tag_model_1 = require("../standard-tag/standard-tag.model");
const standard_attribute_model_1 = require("../standard-attribute/standard-attribute.model");
let StandardValues = class StandardValues extends sequelize_typescript_1.Model {
};
exports.StandardValues = StandardValues;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => standard_attribute_model_1.StandardAttribute),
    (0, sequelize_typescript_1.Column)({ field: 'standard_id', type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], StandardValues.prototype, "standardId", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => standard_tag_model_1.StandardTag),
    (0, sequelize_typescript_1.Column)({ field: 'tag_id', type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], StandardValues.prototype, "tagId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], StandardValues.prototype, "quantity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING }),
    __metadata("design:type", String)
], StandardValues.prototype, "note", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => standard_tag_model_1.StandardTag),
    __metadata("design:type", standard_tag_model_1.StandardTag)
], StandardValues.prototype, "tag", void 0);
exports.StandardValues = StandardValues = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "standard_values", timestamps: false })
], StandardValues);
//# sourceMappingURL=standard-values.model.js.map