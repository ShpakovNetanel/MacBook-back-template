import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CommentController } from "./comment.controller";
import { CommentRepository } from "./comment.repository";
import { CommentService } from "./comment.service";
import { Comment } from "./comment.model";

@Module({
    imports: [SequelizeModule.forFeature([Comment])],
    providers: [CommentRepository, CommentService],
    controllers: [CommentController]
})
export class CommentModule { }