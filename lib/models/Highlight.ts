import { Schema, model, models, type InferSchemaType } from 'mongoose'

const HighlightSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    coverImageId: { type: Schema.Types.ObjectId, ref: 'fs.files', required: false },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
)

HighlightSchema.index({ userId: 1, updatedAt: -1 })

export type HighlightDoc = InferSchemaType<typeof HighlightSchema>

export const Highlight = models.Highlight || model('Highlight', HighlightSchema)
