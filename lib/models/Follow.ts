import { Schema, models, model, type InferSchemaType } from "mongoose"

const FollowSchema = new Schema(
	{
		followerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
		followingId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
		status: { type: String, enum: ["pending", "accepted"], default: "accepted", index: true },
	},
	{ timestamps: { createdAt: true, updatedAt: false } },
)

FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true })

export type FollowDoc = InferSchemaType<typeof FollowSchema>

export const Follow = models.Follow || model("Follow", FollowSchema)


