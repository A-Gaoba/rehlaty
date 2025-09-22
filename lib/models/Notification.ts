import { Schema, models, model, type InferSchemaType } from "mongoose"

const NotificationSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
		type: { type: String, enum: ["like", "comment", "follow", "follow_request", "message"], required: true },
		fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		postId: { type: Schema.Types.ObjectId, ref: "Post" },
		message: { type: String, required: true },
		isRead: { type: Boolean, default: false, index: true },
	},
	{ timestamps: { createdAt: true, updatedAt: false } },
)

NotificationSchema.index({ createdAt: -1 })

export type NotificationDoc = InferSchemaType<typeof NotificationSchema>

export const Notification = models.Notification || model("Notification", NotificationSchema)


