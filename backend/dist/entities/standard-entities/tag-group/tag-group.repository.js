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
exports.TagGroupRepository = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const tag_group_model_1 = require("./tag-group.model");
const standard_tag_model_1 = require("../standard-tag/standard-tag.model");
const unit_standard_tag_model_1 = require("../unit-standard-tag/unit-standard-tag.model");
const unit_id_model_1 = require("../../unit-entities/unit-id/unit-id.model");
const unit_model_1 = require("../../unit-entities/unit/unit.model");
const sequelize_2 = require("sequelize");
let TagGroupRepository = class TagGroupRepository {
    tagGroup;
    constructor(tagGroup) {
        this.tagGroup = tagGroup;
    }
    fetchAll(level) {
        return this.tagGroup.findAll({
            include: [{
                    model: standard_tag_model_1.StandardTag,
                    required: false,
                    include: [{
                            model: unit_standard_tag_model_1.UnitStandardTags,
                            required: false,
                            include: [{
                                    model: unit_id_model_1.UnitId,
                                    required: false,
                                    include: [{
                                            model: unit_model_1.Unit
                                        }]
                                }],
                        }],
                    where: {
                        unitLevel: { [sequelize_2.Op.gte]: level }
                    }
                }]
        });
    }
    fetchById(id) {
        return this.tagGroup.findOne({
            where: { id }
        });
    }
    fetchByDescription(description) {
        return this.tagGroup.findOne({
            where: {
                description
            }
        });
    }
    createTagGroup(tagGroup) {
        return this.tagGroup.upsert(tagGroup);
    }
    updateTagGroup(tagGroup) {
        return this.tagGroup.upsert(tagGroup);
    }
    deleteTagGroup(id) {
        return this.tagGroup.destroy({
            where: { id }
        });
    }
};
exports.TagGroupRepository = TagGroupRepository;
exports.TagGroupRepository = TagGroupRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(tag_group_model_1.TagGroup)),
    __metadata("design:paramtypes", [Object])
], TagGroupRepository);
//# sourceMappingURL=tag-group.repository.js.map