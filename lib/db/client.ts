import { createClient } from "@libsql/client";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/lib/db/schema";

type Db = LibSQLDatabase<typeof schema>;

let cachedDb: Db | null = null;

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
  cachedDb = drizzle(client, { schema }) as Db;
  return cachedDb;
}

export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const actual = getDb();
    return (actual as Db)[prop as keyof Db];
  },
});
