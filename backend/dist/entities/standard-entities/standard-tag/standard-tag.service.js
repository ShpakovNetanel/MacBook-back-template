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
exports.StandardTagService = void 0;
const common_1 = require("@nestjs/common");
const standard_tag_repository_1 = require("./standard-tag.repository");
const constants_1 = require("../../../constants");
const remeda_1 = require("remeda");
const standard_values_repository_1 = require("../standard-values/standard-values.repository");
let StandardTagService = class StandardTagService {
    repository;
    standardValuesRepository;
    constructor(repository, standardValuesRepository) {
        this.repository = repository;
        this.standardValuesRepository = standardValuesRepository;
    }
    async createTag(createTag) {
        try {
            const existingTagByDescription = await this.repository.fetchByDescription(createTag.tag, createTag.tagGroupId);
            if (!(0, remeda_1.isNullish)(existingTagByDescription)) {
                throw new common_1.BadGatewayException({
                    message: 'התגית קיימת לרמה הארגונית תחת קבוצה זו',
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            await this.repository.createTag(createTag);
            return {
                message: 'התגית נוצרה בהצלחה',
                type: constants_1.MESSAGE_TYPES.SUCCESS
            };
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadGatewayException({
                message: error?.response?.message ?? `התגית לא נוצרה, יש לנסות שוב`,
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
    }
    async updateTag(updateTag) {
        try {
            const existingTag = await this.repository.fetchByDescription(updateTag.tag, updateTag.tagGroupId);
            if ((0, remeda_1.isDefined)(existingTag) && existingTag?.dataValues.tag === updateTag.tag
                && existingTag.dataValues.unitLevel === updateTag.unitLevel) {
                throw new common_1.BadGatewayException({
                    message: 'התגית לא עודכנה, יש לבטל את הפעולה',
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            await this.repository.updateTag(updateTag);
            return {
                message: 'התגית עודכנה בהצלחה',
                type: constants_1.MESSAGE_TYPES.SUCCESS
            };
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadGatewayException({
                message: error?.response?.message ?? `התגית לא עודכנה, יש לנסות שוב`,
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
    }
    async deleteTag(id) {
        try {
            const standardValues = await this.standardValuesRepository.fetchByTagId(id);
            if (!(0, remeda_1.isEmptyish)(standardValues)) {
                throw new common_1.BadGatewayException({
                    message: 'לא ניתן למחוק את התגית, קיימים ערכי תקינה מקושרים',
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            await this.repository.deleteTag(id);
            return {
                message: 'התגית נמחקה בהצלחה',
                type: constants_1.MESSAGE_TYPES.SUCCESS
            };
        }
        catch (error) {
            throw new common_1.BadGatewayException({
                message: error?.response?.message ?? 'לא היה ניתן למחוק את התגית',
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
    }
};
exports.StandardTagService = StandardTagService;
exports.StandardTagService = StandardTagService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [standard_tag_repository_1.StandardTagRepository,
        standard_values_repository_1.StandardValuesRepository])
], StandardTagService);
//# sourceMappingURL=standard-tag.service.js.map