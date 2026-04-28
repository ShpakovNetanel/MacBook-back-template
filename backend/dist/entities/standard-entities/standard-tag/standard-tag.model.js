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
exports.StandardTag = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const tag_group_model_1 = require("../tag-group/tag-group.model");
const unit_standard_tag_model_1 = require("../unit-standard-tag/unit-standard-tag.model");
const standard_values_model_1 = require("../standard-values/standard-values.model");
let StandardTag = class StandardTag extends sequelize_typescript_1.Model {
};
exports.StandardTag = StandardTag;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], StandardTag.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING }),
    __metadata("design:type", String)
], StandardTag.prototype, "tag", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'unit_level' }),
    __metadata("design:type", Number)
], StandardTag.prototype, "unitLevel", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => tag_group_model_1.TagGroup),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'tag_group_id' }),
    __metadata("design:type", Number)
], StandardTag.prototype, "tagGroupId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => tag_group_model_1.TagGroup),
    __metadata("design:type", tag_group_model_1.TagGroup)
], StandardTag.prototype, "tagGroup", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => unit_standard_tag_model_1.UnitStandardTags),
    __metadata("design:type", Array)
], StandardTag.prototype, "unitStandardTags", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => standard_values_model_1.StandardValues),
    __metadata("design:type", Array)
], StandardTag.prototype, "standardValues", void 0);
exports.StandardTag = StandardTag = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'standard_tags', timestamps: false })
], StandardTag);
//# sourceMappingURL=standard-tag.model.js.map