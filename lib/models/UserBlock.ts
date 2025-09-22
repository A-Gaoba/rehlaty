import { Schema, model, models, type InferSchemaType } from 'mongoose'

const UserBlockSchema = new Schema(
  {
    blockerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    blockedId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

UserBlockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true })

export type UserBlockDoc = InferSchemaType<typeof UserBlockSchema>

export const UserBlock = models.UserBlock || model('UserBlock', UserBlockSchema)
