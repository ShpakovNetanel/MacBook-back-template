import { Comment, IComment } from "./comment.model";
export declare class CommentRepository {
    private commentModel;
    constructor(commentModel: typeof Comment);
    postComment(comment: IComment): Promise<[Comment, boolean | null]>;
    deleteComment(comment: IComment): Promise<number>;
}
