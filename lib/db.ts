import mongoose from "mongoose"
import { env } from "./env"

// Cache the Mongoose connection across hot-reloads in Next.js dev
// to prevent exhausting connections.
declare global {
  // eslint-disable-next-line no-var
  var __mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined
}

const cached = global.__mongoose || (global.__mongoose = { conn: null, promise: null })

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    if (process.env.NODE_ENV !== "production") {
      // Print the MongoDB URI so you can verify it's set correctly in the terminal
      console.log(`[db] MONGODB_URI=${env.MONGODB_URI}`)
    }
    cached.promise = mongoose.connect(env.MONGODB_URI, {
      // Avoid deprecation warnings and unnecessary buffering
      bufferCommands: false,
      // You can add more connection options here if needed
    })
  }

  cached.conn = await cached.promise
  if (process.env.NODE_ENV !== "production") {
    const host = cached.conn.connection.host
    const name = cached.conn.connection.name
    console.log(`[db] Connected to ${host}/${name}`)
  }
  return cached.conn
}


