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
exports.UnitStatusController = void 0;
const common_1 = require("@nestjs/common");
const units_statuses_service_1 = require("./units-statuses.service");
const updateUnitStatus_1 = require("./DTO/updateUnitStatus");
let UnitStatusController = class UnitStatusController {
    service;
    constructor(service) {
        this.service = service;
    }
    updateHierarchyStatuses(unitsStatuses, request) {
        return this.service.updateHierarchyStatuses(unitsStatuses, request?.['date']);
    }
};
exports.UnitStatusController = UnitStatusController;
__decorate([
    (0, common_1.Post)(''),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateUnitStatus_1.UpdateUnitStatus, Object]),
    __metadata("design:returntype", void 0)
], UnitStatusController.prototype, "updateHierarchyStatuses", null);
exports.UnitStatusController = UnitStatusController = __decorate([
    (0, common_1.Controller)('statuses'),
    __metadata("design:paramtypes", [units_statuses_service_1.UnitStatusService])
], UnitStatusController);
//# sourceMappingURL=units-statuses.controller.js.map