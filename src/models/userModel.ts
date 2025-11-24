import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";
import fs from "fs";

// Ensure the database folder exists
const dbFolder = path.resolve(__dirname, "../../database");
if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
}

// Absolute path to the database file
const dbFile = path.join(dbFolder, "gymhub.db");

// Define a type for the database connection
export async function openDb(): Promise<Database> {
  return open({
    filename: dbFile,
    driver: sqlite3.Database,
  });
}

export async function createTable(): Promise<void> {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      aulas TEXT NOT NULL DEFAULT '[]',
      planos TEXT NOT NULL DEFAULT '[]',
      dias TEXT NOT NULL DEFAULT '[]'
    )
  `);
  await db.close();
}
