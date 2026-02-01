import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/lib/db/schema";

let cachedDb: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (cachedDb) {
    return cachedDb;
  }

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error("Missing TURSO_DATABASE_URL");
  }

  const authToken = process.env.TURSO_AUTH_TOKEN;
  const client = createClient({ url, authToken });
  cachedDb = drizzle(client, { schema });
  return cachedDb;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const actual = getDb() as Record<PropertyKey, unknown>;
    return actual[prop];
  },
});
