import { Schema, models, model, type InferSchemaType } from 'mongoose'

const ConversationSchema = new Schema(
  {
    participantIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      required: true,
      index: true,
    },
    lastMessageId: { type: Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
)

ConversationSchema.index({ updatedAt: -1 })

export type ConversationDoc = InferSchemaType<typeof ConversationSchema>

export const Conversation = models.Conversation || model('Conversation', ConversationSchema)
