import "dotenv/config";

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { DatabaseSync } from "node:sqlite";

const MIGRATION_TABLE = "__festival_companion_migrations";

function resolveDatabasePath(databaseUrl: string, cwd: string) {
  if (!databaseUrl.startsWith("file:")) {
    throw new Error(
      `Unsupported DATABASE_URL "${databaseUrl}". Expected a SQLite file: URL.`,
    );
  }

  const rawPath = databaseUrl.slice("file:".length);

  if (!rawPath || rawPath === ":memory:") {
    return rawPath || ":memory:";
  }

  if (rawPath.startsWith("/")) {
    return rawPath;
  }

  return path.resolve(cwd, "prisma", rawPath);
}

function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

function main() {
  const cwd = process.cwd();
  const migrationsRoot = path.join(cwd, "prisma", "migrations");
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  const databasePath = resolveDatabasePath(databaseUrl, cwd);

  if (databasePath !== ":memory:") {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  }

  const db = new DatabaseSync(databasePath);

  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS "${MIGRATION_TABLE}" (
      "name" TEXT NOT NULL PRIMARY KEY,
      "checksum" TEXT NOT NULL,
      "appliedAt" TEXT NOT NULL
    );
  `);

  const appliedRows = db
    .prepare(`SELECT name, checksum FROM "${MIGRATION_TABLE}" ORDER BY name ASC`)
    .all() as Array<{ name: string; checksum: string }>;

  const appliedByName = new Map(
    appliedRows.map((migration) => [migration.name, migration.checksum]),
  );

  const migrationDirectories = fs
    .readdirSync(migrationsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  let appliedCount = 0;

  for (const directory of migrationDirectories) {
    const migrationPath = path.join(migrationsRoot, directory, "migration.sql");

    if (!fs.existsSync(migrationPath)) {
      continue;
    }

    const sql = fs.readFileSync(migrationPath, "utf8").trim();

    if (!sql) {
      continue;
    }

    const checksum = sha256(sql);
    const existingChecksum = appliedByName.get(directory);

    if (existingChecksum) {
      if (existingChecksum !== checksum) {
        throw new Error(
          `Migration "${directory}" has changed since it was applied. Refusing to continue.`,
        );
      }

      console.log(`skip ${directory}`);
      continue;
    }

    db.exec("BEGIN");

    try {
      db.exec(sql);

      db.prepare(
        `INSERT INTO "${MIGRATION_TABLE}" (name, checksum, appliedAt) VALUES (?, ?, ?)`,
      ).run(directory, checksum, new Date().toISOString());

      db.exec("COMMIT");
      appliedCount += 1;
      console.log(`apply ${directory}`);
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  if (appliedCount === 0) {
    console.log("No new migrations to apply.");
  }
}

main();
