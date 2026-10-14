import mongoose from "mongoose";

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("Please define MONGODB_URI in environment variables");
  }
  return uri;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(getMongoUri(), {
      bufferCommands: false,
      /** Serverless-friendly pool (Atlas + Vercel). */
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15_000,
      socketTimeoutMS: 45_000,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
