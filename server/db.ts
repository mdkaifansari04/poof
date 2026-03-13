import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

type EarlyAccessSignup = {
  createdAt: string;
  email: string;
  id: number;
  source: string | null;
};

const globalForDb = globalThis as unknown as {
  db: DatabaseSync | undefined;
};

function getDatabaseFilePath() {
  const dataDirectory = path.join(process.cwd(), "data");
  mkdirSync(dataDirectory, { recursive: true });
  return path.join(dataDirectory, "poof.sqlite");
}

export function getDb() {
  if (globalForDb.db) {
    return globalForDb.db;
  }

  const db = new DatabaseSync(getDatabaseFilePath());
  db.exec(`
    CREATE TABLE IF NOT EXISTS early_access_signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      source TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  globalForDb.db = db;
  return db;
}

export function saveEarlyAccessSignup(email: string, source?: string | null) {
  const db = getDb();

  const existingSignup = db
    .prepare(
      `
        SELECT id, email, source, created_at as createdAt
        FROM early_access_signups
        WHERE email = ?
      `,
    )
    .get(email) as EarlyAccessSignup | undefined;

  if (existingSignup) {
    return {
      alreadyJoined: true,
      signup: existingSignup,
    };
  }

  db.prepare(
    `
      INSERT INTO early_access_signups (email, source)
      VALUES (?, ?)
    `,
  ).run(email, source ?? null);

  const signup = db
    .prepare(
      `
        SELECT id, email, source, created_at as createdAt
        FROM early_access_signups
        WHERE email = ?
      `,
    )
    .get(email) as EarlyAccessSignup;

  return {
    alreadyJoined: false,
    signup,
  };
}
