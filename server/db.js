// ── Leaderboard persistence (SQLite via better-sqlite3) ──────────────────────
// A single small table is all this needs: we only ever keep the global top
// N scores, so there is no need for a heavier database engine.
import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.GEMDIGGER_DB_PATH || path.join(__dirname, 'leaderboard.db');

export function openDb() {
    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
        CREATE TABLE IF NOT EXISTS scores (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            score INTEGER NOT NULL,
            depth INTEGER NOT NULL DEFAULT 0,
            gems INTEGER NOT NULL DEFAULT 0,
            createdAt INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
    `);
    return db;
}

// Insert a score entry; ids are client-generated (crypto.randomUUID-style)
// so re-submits are idempotent (INSERT OR REPLACE).
export function insertScore(db, entry) {
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO scores (id, name, score, depth, gems, createdAt)
        VALUES (@id, @name, @score, @depth, @gems, @createdAt)
    `);
    stmt.run(entry);
}

export function getTopScores(db, limit = 10) {
    return db.prepare(`SELECT id, name, score, depth, gems FROM scores ORDER BY score DESC LIMIT ?`).all(limit);
}
