"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeadersMiddeware = void 0;
const common_1 = require("@nestjs/common");
let HeadersMiddeware = class HeadersMiddeware {
    use(req, res, next) {
        const date = req.headers['screendate'];
        const user = req.headers['user'];
        if (!date)
            throw new common_1.UnauthorizedException('Missing authorization headers');
        const normalizedUser = Array.isArray(user) ? user[0] : user;
        req['date'] = date;
        req['username'] = typeof normalizedUser === 'string' && normalizedUser.trim()
            ? normalizedUser.trim()
            : 'S9107544';
        next();
    }
};
exports.HeadersMiddeware = HeadersMiddeware;
exports.HeadersMiddeware = HeadersMiddeware = __decorate([
    (0, common_1.Injectable)()
], HeadersMiddeware);
//# sourceMappingURL=headers.js.map