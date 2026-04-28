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
exports.TagGroupService = void 0;
const common_1 = require("@nestjs/common");
const tag_group_repository_1 = require("./tag-group.repository");
const constants_1 = require("../../../constants");
const remeda_1 = require("remeda");
const standard_values_repository_1 = require("../standard-values/standard-values.repository");
let TagGroupService = class TagGroupService {
    repository;
    standardValuesRepository;
    constructor(repository, standardValuesRepository) {
        this.repository = repository;
        this.standardValuesRepository = standardValuesRepository;
    }
    async fetchAll(level) {
        const tagsGroups = await this.repository.fetchAll(level);
        return tagsGroups.map(tagGroup => ({
            id: tagGroup.dataValues.id,
            description: tagGroup.dataValues.description,
            tags: tagGroup.tags?.map(tag => ({
                id: tag.dataValues.id,
                description: tag.dataValues.tag,
                unitLevel: tag.dataValues.unitLevel,
                units: tag.unitStandardTags.map(unitStandardTag => ({
                    id: unitStandardTag.Unit.activeDetail?.dataValues.unitId,
                    description: unitStandardTag.Unit.activeDetail?.dataValues.description
                })).sort((a, b) => a.description.localeCompare(b.description))
            })).sort((a, b) => {
                if (a.unitLevel === b.unitLevel)
                    return a.description.localeCompare(b.description);
                return a.unitLevel - b.unitLevel;
            })
        })).sort((a, b) => a.description.localeCompare(b.description));
    }
    async createTagGroup(createTagGroupDTO) {
        try {
            const existingTag = await this.repository.fetchByDescription(createTagGroupDTO.description);
            if (!(0, remeda_1.isNullish)(existingTag) && !(0, remeda_1.isDefined)(createTagGroupDTO.id)) {
                throw new common_1.BadGatewayException({
                    message: `קבוצת התגיות ${createTagGroupDTO.description} כבר קיימת, היצירה נכשלה`
                });
            }
            await this.repository.createTagGroup(createTagGroupDTO);
            return {
                message: `התגית ${createTagGroupDTO.description} נשמרה בהצלחה`,
                type: constants_1.MESSAGE_TYPES.SUCCESS
            };
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadGatewayException({
                message: error?.response?.message ?? `נכשלה שמירת התגית ${createTagGroupDTO.description}, יש לנסות שנית`,
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
    }
    async updateTagGroupDTO(updateTagGroupDTO) {
        try {
            const existingTag = await this.repository.fetchById(updateTagGroupDTO.id);
            if (existingTag?.dataValues.description === updateTagGroupDTO.description) {
                throw new common_1.BadGatewayException({
                    message: 'קבוצת התגיות חא נערכה',
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            await this.repository.updateTagGroup(updateTagGroupDTO);
            return {
                message: 'קבוצת התגיות נערכה בהצלחה',
                type: constants_1.MESSAGE_TYPES.SUCCESS
            };
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadGatewayException({
                message: error?.response?.message ?? 'נכשלה עריכת התגובה, יש לנסות שנית',
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
    }
    async deleteTagGroup(id) {
        try {
            const standardValueByTagGroupId = await this.standardValuesRepository.fetchByTagGroupId(id);
            if (!(0, remeda_1.isEmptyish)(standardValueByTagGroupId)) {
                throw new common_1.BadGatewayException({
                    message: 'לא ניתן למחוק את קבוצת התגיות, קיימים ערכי תקינה מקושרים',
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            await this.repository.deleteTagGroup(id);
            return {
                message: 'קבוצת התגיות נמחקה בהצלחה',
                type: constants_1.MESSAGE_TYPES.SUCCESS
            };
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadGatewayException({
                message: error?.response?.message ?? 'מחיקת קבוצת התגיות נכשלה, יש לנסות שנית',
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
    }
};
exports.TagGroupService = TagGroupService;
exports.TagGroupService = TagGroupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tag_group_repository_1.TagGroupRepository,
        standard_values_repository_1.StandardValuesRepository])
], TagGroupService);
//# sourceMappingURL=tag-group.service.js.map