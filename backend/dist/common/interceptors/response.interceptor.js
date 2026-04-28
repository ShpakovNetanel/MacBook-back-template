"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const remeda_1 = require("remeda");
const operators_1 = require("rxjs/operators");
const isResponseShape = (value) => {
    if (!value || typeof value !== "object")
        return false;
    const asRecord = value;
    if (typeof asRecord.success !== "boolean")
        return false;
    if (typeof asRecord.statusCode !== "number")
        return false;
    const body = asRecord.body;
    if (!body || typeof body !== "object")
        return false;
    if (!("data" in body))
        return false;
    if (typeof body.message !== "string")
        return false;
    return true;
};
const splitMessageAndData = (value) => {
    if (!value || typeof value !== "object")
        return null;
    const asRecord = value;
    if (!("message" in asRecord) || !("type" in asRecord))
        return null;
    const message = asRecord.message;
    if (typeof message !== "string")
        return null;
    const type = asRecord.type;
    if (typeof type !== "string")
        return null;
    const keys = Object.keys(asRecord);
    const validKeys = keys.every((key) => ["data", "message", "type"].includes(key));
    if (!validKeys)
        return null;
    return { data: asRecord.data ?? [], message, type };
};
let ResponseInterceptor = class ResponseInterceptor {
    intercept(context, next) {
        const httpResponse = context.switchToHttp().getResponse();
        return next.handle().pipe((0, operators_1.map)((data) => {
            if (isResponseShape(data))
                return data;
            const split = splitMessageAndData(data);
            return {
                success: true,
                statusCode: httpResponse?.statusCode ?? 200,
                body: {
                    data: split ? split.data : (0, remeda_1.isDefined)(data) ? data : [],
                    message: split?.message ?? "OK",
                    ...(split ? { type: split.type } : {}),
                },
            };
        }));
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = __decorate([
    (0, common_1.Injectable)()
], ResponseInterceptor);
//# sourceMappingURL=response.interceptor.js.map