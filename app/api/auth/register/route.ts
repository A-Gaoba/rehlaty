import { z } from 'zod'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/models/User'
import { hashPassword } from '@/lib/auth/hash'
import { badRequest, serverError } from '@/lib/api/errors'

const RegisterSchema = z.object({
	email: z.string().email(),
	username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
	password: z.string().min(8),
	displayName: z.string().min(1).max(64),
})

export async function POST(req: Request) {
	try {
		const json = await req.json()
		const parsed = RegisterSchema.safeParse(json)
		if (!parsed.success) {
			return badRequest('Invalid payload')
		}

		await connectToDatabase()

		const existingEmail = await User.findOne({ email: parsed.data.email }).lean()
		if (existingEmail) return badRequest('Email already in use')
		const existingUsername = await User.findOne({ username: parsed.data.username }).lean()
		if (existingUsername) return badRequest('Username already in use')

		const passwordHash = await hashPassword(parsed.data.password)
		const user = await User.create({
			email: parsed.data.email,
			username: parsed.data.username,
			passwordHash,
			displayName: parsed.data.displayName,
			bio: '',
			isPrivate: false,
			isVerified: false,
			interests: [],
		})

		return Response.json({
			user: {
				id: user._id.toString(),
				email: user.email,
				username: user.username,
				displayName: user.displayName,
				isVerified: user.isVerified,
				isPrivate: user.isPrivate,
			},
		})
	} catch (err) {
		return serverError('Failed to register user')
	}
}


