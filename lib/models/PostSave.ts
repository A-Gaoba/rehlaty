import { Schema, model, models, type InferSchemaType } from 'mongoose'

const PostSaveSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

PostSaveSchema.index({ userId: 1, postId: 1 }, { unique: true })

export type PostSaveDoc = InferSchemaType<typeof PostSaveSchema>

export const PostSave = models.PostSave || model('PostSave', PostSaveSchema)
