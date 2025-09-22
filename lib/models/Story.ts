import { Schema, model, models, type InferSchemaType } from 'mongoose'

const StorySchema = new Schema(
  {
    highlightId: { type: Schema.Types.ObjectId, ref: 'Highlight', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    imageFileId: { type: Schema.Types.ObjectId, ref: 'fs.files', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

StorySchema.index({ highlightId: 1, createdAt: 1 })

export type StoryDoc = InferSchemaType<typeof StorySchema>

export const Story = models.Story || model('Story', StorySchema)


