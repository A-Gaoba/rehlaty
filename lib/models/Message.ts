import { Schema, models, model, type InferSchemaType } from "mongoose"

const MessageSchema = new Schema(
	{
		conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
		senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		content: { type: String, required: true },
		type: { type: String, enum: ["text", "image"], default: "text" },
		isReadBy: { type: [{ type: Schema.Types.ObjectId, ref: "User" }], default: [] },
	},
	{ timestamps: { createdAt: true, updatedAt: false } },
)

MessageSchema.index({ createdAt: 1 })

export type MessageDoc = InferSchemaType<typeof MessageSchema>

export const Message = models.Message || model("Message", MessageSchema)


