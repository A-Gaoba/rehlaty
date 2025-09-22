import { Schema, models, model, type InferSchemaType } from 'mongoose'

const PostLikeSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

PostLikeSchema.index({ postId: 1, userId: 1 }, { unique: true })

export type PostLikeDoc = InferSchemaType<typeof PostLikeSchema>

export const PostLike = models.PostLike || model('PostLike', PostLikeSchema)
