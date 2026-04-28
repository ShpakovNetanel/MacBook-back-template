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
exports.StandardController = void 0;
const common_1 = require("@nestjs/common");
const standard_service_1 = require("./standard.service");
let StandardController = class StandardController {
    service;
    constructor(service) {
        this.service = service;
    }
    getToolMaterialIds(request) {
        const unitId = Number(request.headers["unit"]);
        return this.service.getRelevantToolMaterialIds(unitId, request["date"]);
    }
    getStandard(request) {
        const unitId = Number(request.headers["unit"]);
        return this.service.getStandards(unitId, request["date"]);
    }
};
exports.StandardController = StandardController;
__decorate([
    (0, common_1.Get)("tool-material-ids"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], StandardController.prototype, "getToolMaterialIds", null);
__decorate([
    (0, common_1.Get)(""),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], StandardController.prototype, "getStandard", null);
exports.StandardController = StandardController = __decorate([
    (0, common_1.Controller)("/standard"),
    __metadata("design:paramtypes", [standard_service_1.StandardService])
], StandardController);
//# sourceMappingURL=standard.controller.js.map