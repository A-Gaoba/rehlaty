import { Schema, models, model, type InferSchemaType } from "mongoose"

const CommentSchema = new Schema(
	{
		postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		content: { type: String, required: true },
		parentId: { type: Schema.Types.ObjectId, ref: "Comment", required: false, index: true },
		likesCount: { type: Number, default: 0 },
	},
	{ timestamps: { createdAt: true, updatedAt: false } },
)

CommentSchema.index({ createdAt: -1 })

export type CommentDoc = InferSchemaType<typeof CommentSchema>

export const Comment = models.Comment || model("Comment", CommentSchema)


