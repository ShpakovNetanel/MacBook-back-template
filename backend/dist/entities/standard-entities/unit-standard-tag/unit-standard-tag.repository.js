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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitStanadrdTagRepository = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const unit_standard_tag_model_1 = require("./unit-standard-tag.model");
let UnitStanadrdTagRepository = class UnitStanadrdTagRepository {
    unitStandardTags;
    constructor(unitStandardTags) {
        this.unitStandardTags = unitStandardTags;
    }
    fetchUnitStandardTag(unitStandardTag) {
        return this.unitStandardTags.findOne({
            where: unitStandardTag
        });
    }
    createUnitStandardTag(unitStandardTag) {
        return this.unitStandardTags.create(unitStandardTag);
    }
    removeUnitStandardTag(unitStandardTag) {
        return this.unitStandardTags.destroy({
            where: {
                unitId: unitStandardTag.unitId,
                tagId: unitStandardTag.tagId
            }
        });
    }
};
exports.UnitStanadrdTagRepository = UnitStanadrdTagRepository;
exports.UnitStanadrdTagRepository = UnitStanadrdTagRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(unit_standard_tag_model_1.UnitStandardTags)),
    __metadata("design:paramtypes", [Object])
], UnitStanadrdTagRepository);
//# sourceMappingURL=unit-standard-tag.repository.js.map