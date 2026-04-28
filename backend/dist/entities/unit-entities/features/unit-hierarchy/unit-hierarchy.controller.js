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
exports.UnitHierarchyController = void 0;
const common_1 = require("@nestjs/common");
const unit_hierarchy_service_1 = require("./unit-hierarchy.service");
const remove_unit_relation_dto_1 = require("./DTO/remove-unit-relation.dto");
const add_unit_relation_dto_1 = require("./DTO/add-unit-relation.dto");
const update_unit_relation_dto_1 = require("./DTO/update-unit-relation.dto");
let UnitHierarchyController = class UnitHierarchyController {
    service;
    constructor(service) {
        this.service = service;
    }
    async getAllUnits(request) {
        return this.service.getAllUnitsWithParents(request?.["date"]);
    }
    async getHierarchy(request) {
        const username = request?.['username'];
        return this.service.getHierarchyForUser(username, request?.["date"]);
    }
    addUnitRelation(addUnitRelationDto, request) {
        return this.service.addUnitRelation(addUnitRelationDto, request?.["date"], request?.["username"]);
    }
    removeUnitRelation(removeUnitRelationDto, request) {
        return this.service.removeUnitRelation(removeUnitRelationDto, request?.["date"]);
    }
    transferUnitRelation(transferUnitRelationDto, request) {
        return this.service.transferUnitRelation(transferUnitRelationDto, request?.["date"], request?.["username"]);
    }
};
exports.UnitHierarchyController = UnitHierarchyController;
__decorate([
    (0, common_1.Get)(""),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UnitHierarchyController.prototype, "getAllUnits", null);
__decorate([
    (0, common_1.Get)("hierarchy"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UnitHierarchyController.prototype, "getHierarchy", null);
__decorate([
    (0, common_1.Post)("hierarchy"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_unit_relation_dto_1.AddUnitRelationDto, Object]),
    __metadata("design:returntype", void 0)
], UnitHierarchyController.prototype, "addUnitRelation", null);
__decorate([
    (0, common_1.Delete)("hierarchy"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [remove_unit_relation_dto_1.RemoveUnitRelationDto, Object]),
    __metadata("design:returntype", void 0)
], UnitHierarchyController.prototype, "removeUnitRelation", null);
__decorate([
    (0, common_1.Put)("hierarchy"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_unit_relation_dto_1.TransferUnitRelationDto, Object]),
    __metadata("design:returntype", void 0)
], UnitHierarchyController.prototype, "transferUnitRelation", null);
exports.UnitHierarchyController = UnitHierarchyController = __decorate([
    (0, common_1.Controller)("/units"),
    __metadata("design:paramtypes", [unit_hierarchy_service_1.UnitHierarchyService])
], UnitHierarchyController);
//# sourceMappingURL=unit-hierarchy.controller.js.map