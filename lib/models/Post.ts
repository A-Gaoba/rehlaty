import { Schema, models, model, type InferSchemaType } from "mongoose"

const LocationSchema = new Schema(
	{
		name: { type: String, required: true },
		city: { type: String, required: true },
		coordinates: {
			type: [Number],
			validate: [(val: number[]) => val.length === 2, "coordinates must be [lng, lat]"],
			required: true,
		},
	},
	{ _id: false },
)

const PostSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
		caption: { type: String, required: true },
		imageFileId: { type: Schema.Types.ObjectId, ref: "fs.files", required: true },
		location: { type: LocationSchema, required: true },
		rating: { type: Number, min: 1, max: 5, default: 5 },
		hashtags: { type: [String], default: [], index: true },
		likesCount: { type: Number, default: 0 },
		commentsCount: { type: Number, default: 0 },
	},
	{ timestamps: { createdAt: true, updatedAt: false } },
)

PostSchema.index({ createdAt: -1 })
PostSchema.index({ "location.coordinates": "2dsphere" })

export type PostDoc = InferSchemaType<typeof PostSchema>

export const Post = models.Post || model("Post", PostSchema)


