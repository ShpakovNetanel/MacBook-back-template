import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Comment, IComment } from "./comment.model";

@Injectable()
export class CommentRepository {
    constructor(@InjectModel(Comment) private commentModel: typeof Comment) { }

    postComment(comment: IComment) { 
        return this.commentModel.upsert(comment)
    }

    deleteComment(comment: IComment) {
        return this.commentModel.destroy({
            where: {
                unitId: comment.unitId,
                recipientUnitId: comment.recipientUnitId,
                materialId: comment.materialId,
                type: comment.type,
                date: comment.date,
            }
        })
     }
}