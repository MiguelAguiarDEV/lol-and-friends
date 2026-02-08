/** Turso + Drizzle client wiring for the data layer. */

import type { ResultSet } from "@libsql/client";
import { createClient } from "@libsql/client";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { drizzle } from "drizzle-orm/libsql";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import * as schema from "@/lib/db/schema";

export type Db = LibSQLDatabase<typeof schema>;

/** Tipo que acepta tanto el cliente principal como una transacción activa. */
export type DbConnection =
  | Db
  | SQLiteTransaction<
      "async",
      ResultSet,
      typeof schema,
      ExtractTablesWithRelations<typeof schema>
    >;

let cachedDb: Db | null = null;
let nullDb: Db | null = null;

/**
 * Indica si la DB está configurada vía TURSO_DATABASE_URL.
 * @returns True si hay URL configurada.
 */
export function isDbConfigured() {
  return Boolean(process.env.TURSO_DATABASE_URL);
}

function getDb() {
  if (cachedDb) {
    return cachedDb;
  }

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    if (!nullDb) {
      const client = createClient({ url: "file::memory:" });
      nullDb = drizzle(client, { schema }) as Db;
    }
    return nullDb;
  }

  const authToken = process.env.TURSO_AUTH_TOKEN;
  let client: ReturnType<typeof createClient>;
  if (authToken === undefined) {
    client = createClient({ url });
  } else {
    client = createClient({ url, authToken });
  }
  cachedDb = drizzle(client, { schema }) as Db;
  return cachedDb;
}

export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const actual = getDb();
    return (actual as Db)[prop as keyof Db];
  },
});
