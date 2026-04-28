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
exports.CommentRepository = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const comment_model_1 = require("./comment.model");
let CommentRepository = class CommentRepository {
    commentModel;
    constructor(commentModel) {
        this.commentModel = commentModel;
    }
    postComment(comment) {
        return this.commentModel.upsert(comment);
    }
    deleteComment(comment) {
        return this.commentModel.destroy({
            where: {
                unitId: comment.unitId,
                recipientUnitId: comment.recipientUnitId,
                materialId: comment.materialId,
                type: comment.type,
                date: comment.date,
            }
        });
    }
};
exports.CommentRepository = CommentRepository;
exports.CommentRepository = CommentRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(comment_model_1.Comment)),
    __metadata("design:paramtypes", [Object])
], CommentRepository);
//# sourceMappingURL=comment.repository.js.map