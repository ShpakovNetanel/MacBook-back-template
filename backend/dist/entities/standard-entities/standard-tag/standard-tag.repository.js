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
exports.StandardTagRepository = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const standard_tag_model_1 = require("./standard-tag.model");
const sequelize_2 = require("sequelize");
const unit_standard_tag_model_1 = require("../unit-standard-tag/unit-standard-tag.model");
let StandardTagRepository = class StandardTagRepository {
    standardTag;
    constructor(standardTag) {
        this.standardTag = standardTag;
    }
    fetchByDescription(description, tagGroupId) {
        return this.standardTag.findOne({
            where: {
                tag: description,
                tagGroupId,
            }
        });
    }
    fetchById(id) {
        return this.standardTag.findOne({
            where: {
                id,
            }
        });
    }
    fetchIfUnitOnAnotherTagOnSameLevel(id, unitLevel, tagGroupId, unitId) {
        return this.standardTag.findOne({
            include: [{
                    model: unit_standard_tag_model_1.UnitStandardTags,
                    where: {
                        unitId
                    }
                }],
            where: {
                id: { [sequelize_2.Op.ne]: id },
                unitLevel,
                tagGroupId
            }
        });
    }
    createTag(standardTag) {
        return this.standardTag.upsert(standardTag);
    }
    updateTag(standardTag) {
        return this.standardTag.upsert(standardTag);
    }
    deleteTag(id) {
        return this.standardTag.destroy({ where: { id } });
    }
};
exports.StandardTagRepository = StandardTagRepository;
exports.StandardTagRepository = StandardTagRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(standard_tag_model_1.StandardTag)),
    __metadata("design:paramtypes", [Object])
], StandardTagRepository);
//# sourceMappingURL=standard-tag.repository.js.map