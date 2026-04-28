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
exports.UnitStandardTagService = void 0;
const common_1 = require("@nestjs/common");
const unit_standard_tag_repository_1 = require("./unit-standard-tag.repository");
const constants_1 = require("../../../constants");
const class_validator_1 = require("class-validator");
const standard_tag_repository_1 = require("../standard-tag/standard-tag.repository");
let UnitStandardTagService = class UnitStandardTagService {
    repository;
    standardTagRepository;
    constructor(repository, standardTagRepository) {
        this.repository = repository;
        this.standardTagRepository = standardTagRepository;
    }
    async createUnitStandardTag(createUnitStandardTag) {
        try {
            const tagLevel = await this.standardTagRepository.fetchById(createUnitStandardTag.tagId);
            const unitOnAnotherTagOnSameLevel = await this.standardTagRepository.fetchIfUnitOnAnotherTagOnSameLevel(createUnitStandardTag.tagId, tagLevel.unitLevel, tagLevel.tagGroupId, createUnitStandardTag.unitId);
            if (unitOnAnotherTagOnSameLevel) {
                throw new common_1.BadRequestException({
                    message: 'יחידה זו מחוברת לתגית מקבילה - תגית אחרת באותה קבוצת תגיות',
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            const existingUnitStandardTag = await this.repository.fetchUnitStandardTag(createUnitStandardTag);
            if ((0, class_validator_1.isDefined)(existingUnitStandardTag)) {
                throw new common_1.BadRequestException({
                    message: 'היחידה כבר תחת התגית הנוכחית, הקשר לא נוצר',
                    type: constants_1.MESSAGE_TYPES.FAILURE
                });
            }
            await this.repository.createUnitStandardTag(createUnitStandardTag);
            return {
                message: 'היחידה התווספה אל התגית',
                type: constants_1.MESSAGE_TYPES.SUCCESS
            };
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadGatewayException({
                message: error?.response?.message ?? 'היחידה לא נוספה אל התגית, יש לנסות שנית',
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
    }
    async removeUnitStandardTag(deleteUnitStandardTag) {
        try {
            await this.repository.removeUnitStandardTag(deleteUnitStandardTag);
            return {
                message: 'היחידה נמחקה מן התגית',
                type: constants_1.MESSAGE_TYPES.SUCCESS
            };
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadGatewayException({
                message: 'היחידה לא נמחקה מן התגית, יש לנסות שנית',
                type: constants_1.MESSAGE_TYPES.FAILURE
            });
        }
    }
};
exports.UnitStandardTagService = UnitStandardTagService;
exports.UnitStandardTagService = UnitStandardTagService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [unit_standard_tag_repository_1.UnitStanadrdTagRepository,
        standard_tag_repository_1.StandardTagRepository])
], UnitStandardTagService);
//# sourceMappingURL=unit-standard-tag.service.js.map