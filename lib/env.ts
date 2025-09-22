import { z } from "zod"

const envSchema = z.object({
	MONGODB_URI: z.string().url({ message: "MONGODB_URI must be a valid URL (mongodb:// or mongodb+srv://)" }),
	JWT_SECRET: z.string().min(32, { message: "JWT_SECRET must be at least 32 characters" }),
	NEXTAUTH_COOKIE_NAME: z.string().min(1),
	NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
})

const parsed = envSchema.safeParse({
	MONGODB_URI: process.env.MONGODB_URI,
	JWT_SECRET: process.env.JWT_SECRET,
	NEXTAUTH_COOKIE_NAME: process.env.NEXTAUTH_COOKIE_NAME,
	NODE_ENV: process.env.NODE_ENV,
})

if (!parsed.success) {
	const formatted = parsed.error.format()
	// Aggregate error messages for easier debugging during boot
	const messages = Object.entries(formatted)
		.filter(([key]) => key !== "_errors")
		.map(([key, val]) => `${key}: ${(val as any)?._errors?.join(", ")}`)
		.join("\n")
	throw new Error(`Invalid environment variables:\n${messages}`)
}

export const env = parsed.data


