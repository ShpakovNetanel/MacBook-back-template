"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const normalizeMessage = (value) => {
    if (typeof value === "string")
        return value;
    if (Array.isArray(value))
        return value.map(String).join(", ");
    if (value && typeof value === "object" && "message" in value) {
        const message = value.message;
        if (typeof message === "string")
            return message;
        if (Array.isArray(message))
            return message.map(String).join(", ");
    }
    return "Internal server error";
};
const normalizeType = (value) => {
    if (!value || typeof value !== "object")
        return null;
    if (!("type" in value))
        return null;
    const type = value.type;
    return typeof type === "string" ? type : null;
};
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const normalized = exception instanceof common_1.HttpException
            ? normalizeMessage(exception.getResponse())
            : null;
        const normalizedType = exception instanceof common_1.HttpException
            ? normalizeType(exception.getResponse())
            : null;
        const message = normalized && normalized !== "Internal server error"
            ? normalized
            : exception instanceof common_1.HttpException
                ? exception.message || "Internal server error"
                : exception instanceof Error
                    ? exception.message || "Internal server error"
                    : "Internal server error";
        response.status(status).json({
            success: false,
            statusCode: status,
            body: {
                data: null,
                message,
                ...(normalizedType ? { type: normalizedType } : {}),
            },
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map