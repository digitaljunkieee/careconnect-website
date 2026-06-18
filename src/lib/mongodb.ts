import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null
};

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = cached;
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = Promise.resolve().then(() => {
      const mongoUri = process.env.DATABASE_URL ?? process.env.MONGODB_URI;

      if (!mongoUri) {
        throw new Error("Missing DATABASE_URL or MONGODB_URI environment variable.");
      }

      return mongoose.connect(mongoUri, {
        bufferCommands: false
      });
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export function getMongoUri() {
  const mongoUri = process.env.DATABASE_URL ?? process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("Missing DATABASE_URL or MONGODB_URI environment variable.");
  }

  return mongoUri;
}
