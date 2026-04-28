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
exports.ReportController = void 0;
const common_1 = require("@nestjs/common");
const report_service_1 = require("./report.service");
let ReportController = class ReportController {
    service;
    constructor(service) {
        this.service = service;
    }
    fetchReports(request) {
        return this.service.fetchReports(request['date'], Number(request.headers['unit']));
    }
    fetchFavoriteReports(request) {
        return this.service.fetchFavoriteReports(request['date'], Number(request.headers['unit']));
    }
    fetchMostRecentMaterials(request) {
        return this.service.fetchMostRecentMaterials(request['date'], Number(request.headers['unit']));
    }
    saveReportsChanges(saveReportsBody, request) {
        return this.service.saveReportsChanges(saveReportsBody, request['date'], Number(request.headers['unit']), request['username']);
    }
    aggregateHierarchy(aggregatedReportsDTO, request) {
        return this.service.aggregateHierarchy(request['date'], Number(request.headers['unit']), request['username'], aggregatedReportsDTO);
    }
    saveAllocations(saveAllocationsDTO, request) {
        return this.service.saveAllocations(saveAllocationsDTO, request['date'], Number(request.headers['unit']), request['username']);
    }
    downloadAllocations(downloadAllocationsDTO, request) {
        return this.service.downloadAllocations(request['date'], Number(request.headers['unit']), request['username'], downloadAllocationsDTO?.materialId);
    }
    inventoryCalculation(inventoryCalculationBody, request) {
        return this.service.inventoryCalculation(request['date'], Number(request.headers['unit']), inventoryCalculationBody?.materialsIds ?? []);
    }
};
exports.ReportController = ReportController;
__decorate([
    (0, common_1.Get)(''),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "fetchReports", null);
__decorate([
    (0, common_1.Get)('favorites'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "fetchFavoriteReports", null);
__decorate([
    (0, common_1.Get)('recentMaterials'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "fetchMostRecentMaterials", null);
__decorate([
    (0, common_1.Post)('committees/save'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Request]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "saveReportsChanges", null);
__decorate([
    (0, common_1.Post)('committees/report'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Request]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "aggregateHierarchy", null);
__decorate([
    (0, common_1.Post)('allocations/save'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Request]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "saveAllocations", null);
__decorate([
    (0, common_1.Post)('allocations/report'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Request]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "downloadAllocations", null);
__decorate([
    (0, common_1.Post)('inventoryCalculation'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Request]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "inventoryCalculation", null);
exports.ReportController = ReportController = __decorate([
    (0, common_1.Controller)('/reports'),
    __metadata("design:paramtypes", [report_service_1.ReportService])
], ReportController);
//# sourceMappingURL=report.controller.js.map