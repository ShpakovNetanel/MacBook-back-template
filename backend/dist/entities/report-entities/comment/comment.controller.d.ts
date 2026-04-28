import { CommentService } from "./comment.service";
import { CommentDTO } from "./comment.types";
export declare class CommentController {
    private readonly service;
    constructor(service: CommentService);
    postComment(comment: CommentDTO, request: Request): Promise<{
        message: string;
        type: string;
    }>;
    deleteComment(comment: CommentDTO, request: Request): Promise<{
        message: string;
        type: string;
    }>;
}
