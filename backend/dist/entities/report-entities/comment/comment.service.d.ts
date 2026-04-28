import { CommentRepository } from "./comment.repository";
import { CommentDTO } from "./comment.types";
export declare class CommentService {
    private readonly repository;
    constructor(repository: CommentRepository);
    postComment(comment: CommentDTO): Promise<{
        message: string;
        type: string;
    }>;
    deleteComment(comment: CommentDTO): Promise<{
        message: string;
        type: string;
    }>;
}
