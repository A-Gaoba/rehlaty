import mongoose, { Schema, type InferSchemaType, models, model } from "mongoose"

const UserSchema = new Schema(
	{
		email: { type: String, required: true, unique: true, index: true },
		username: { type: String, required: true, unique: true, index: true },
		passwordHash: { type: String, required: true },
		displayName: { type: String, required: true },
		bio: { type: String, default: "" },
		avatarFileId: { type: Schema.Types.ObjectId, ref: "fs.files", required: false },
		coverFileId: { type: Schema.Types.ObjectId, ref: "fs.files", required: false },
		isPrivate: { type: Boolean, default: false },
		isVerified: { type: Boolean, default: false },
		interests: { type: [String], default: [] },
	},
	{ timestamps: { createdAt: true, updatedAt: false } },
)

export type UserDoc = InferSchemaType<typeof UserSchema>

export const User = models.User || model("User", UserSchema)


