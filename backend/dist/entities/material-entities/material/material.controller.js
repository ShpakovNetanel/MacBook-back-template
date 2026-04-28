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
exports.MaterialController = void 0;
const common_1 = require("@nestjs/common");
const material_service_1 = require("./material.service");
const material_types_1 = require("./material.types");
let MaterialController = class MaterialController {
    service;
    constructor(service) {
        this.service = service;
    }
    fetchExcelMaterials() {
        return this.service.fetchExcelMaterials();
    }
    fetchTwenty(filter, request, tab) {
        return this.service.fetchTwenty(filter, Number(request.headers['unit']), tab);
    }
    pastedMaterials(pastedMaterials, request, tab) {
        return this.service.fetchByIds(pastedMaterials, Number(request.headers['unit']), Number(tab));
    }
};
exports.MaterialController = MaterialController;
__decorate([
    (0, common_1.Get)('excel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MaterialController.prototype, "fetchExcelMaterials", null);
__decorate([
    (0, common_1.Get)('twenty'),
    __param(0, (0, common_1.Query)('filter')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('tab')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Request, Number]),
    __metadata("design:returntype", void 0)
], MaterialController.prototype, "fetchTwenty", null);
__decorate([
    (0, common_1.Post)('paste'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('tab')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [material_types_1.PastedMaterialsDto,
        Request, Number]),
    __metadata("design:returntype", void 0)
], MaterialController.prototype, "pastedMaterials", null);
exports.MaterialController = MaterialController = __decorate([
    (0, common_1.Controller)('/materials'),
    __metadata("design:paramtypes", [material_service_1.MaterialService])
], MaterialController);
//# sourceMappingURL=material.controller.js.map