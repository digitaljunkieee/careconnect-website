import { MongoClient } from "mongodb";

type MongoClientCache = {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongoClientCache: MongoClientCache | undefined;
}

const cached: MongoClientCache = globalThis.mongoClientCache ?? {
  client: null,
  promise: null
};

if (!globalThis.mongoClientCache) {
  globalThis.mongoClientCache = cached;
}

export function getMongoClientPromise() {
  if (!cached.promise) {
    cached.promise = Promise.resolve().then(() => {
      const mongoUri = process.env.DATABASE_URL ?? process.env.MONGODB_URI;

      if (!mongoUri) {
        throw new Error("Missing DATABASE_URL or MONGODB_URI environment variable.");
      }

      const client = new MongoClient(mongoUri, {
        maxPoolSize: 10
      });

      return client.connect().then((connectedClient) => {
        cached.client = connectedClient;
        return connectedClient;
      });
    });
  }

  return cached.promise;
}
