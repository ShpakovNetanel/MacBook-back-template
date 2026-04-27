import { Body, Controller, Delete, Post, Req } from "@nestjs/common";
import { CommentService } from "./comment.service";
import { CommentDTO } from "./comment.types";

@Controller('comment')
export class CommentController {
    constructor(private readonly service: CommentService) { }

    @Post('')
    postComment(@Body() comment: CommentDTO, @Req() request: Request) {
        return this.service.postComment({
            ...comment,
            date: request?.['date']
        });
    }

    @Delete('')
    deleteComment(@Body() comment: CommentDTO, @Req() request: Request) {
        return this.service.deleteComment({ ...comment, date: new Date(request?.['date']) });
    }
}