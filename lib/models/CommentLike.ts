import { Schema, models, model, type InferSchemaType } from 'mongoose'

const CommentLikeSchema = new Schema(
  {
    commentId: { type: Schema.Types.ObjectId, ref: 'Comment', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

CommentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true })

export type CommentLikeDoc = InferSchemaType<typeof CommentLikeSchema>

export const CommentLike = models.CommentLike || model('CommentLike', CommentLikeSchema)
