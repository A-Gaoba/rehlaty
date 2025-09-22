import mongoose, { Schema, type InferSchemaType, models, model } from 'mongoose'

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true },
    bio: { type: String, default: '' },
    avatarFileId: { type: Schema.Types.ObjectId, ref: 'fs.files', required: false },
    coverFileId: { type: Schema.Types.ObjectId, ref: 'fs.files', required: false },
    birthday: { type: Date, required: false },
    isPrivate: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    interests: { type: [String], default: [] },
    socialLinks: {
      instagram: { type: String, required: false },
      snapchat: { type: String, required: false },
      twitter: { type: String, required: false },
      tiktok: { type: String, required: false },
      website: { type: String, required: false },
    },
    bioLinks: { type: [String], default: [] },
    privacy: { type: String, enum: ['public', 'private'], default: 'public', index: true },
    contactEmail: { type: String, required: false },
    contactPhone: { type: String, required: false },
    notificationPrefs: {
      likes: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      follows: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

export type UserDoc = InferSchemaType<typeof UserSchema>

export const User = models.User || model('User', UserSchema)
