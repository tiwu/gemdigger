// ── GemDigger leaderboard API ────────────────────────────────────────────────
// Minimal Express server exposing a global online leaderboard. Designed to be
// deployed separately from the static GitHub Pages frontend (which points at
// it via window.GEMDIGGER_API_BASE). Falls back gracefully: the frontend
// still works fully offline with a local leaderboard if this is unreachable.
import express from 'express';
import crypto from 'node:crypto';
import { openDb, insertScore, getTopScores } from './db.js';

const PORT = process.env.PORT || 3001;
const MAX_NAME_LEN = 16;

const db = openDb();
const app = express();

// Simple request logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

app.use(express.json());

// Basic permissive CORS since this is a public read-mostly leaderboard API
// consumed by a static site on a different origin (GitHub Pages).
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

function sanitizeName(name) {
    if (typeof name !== 'string') return 'Anonymous';
    const trimmed = name.trim().slice(0, MAX_NAME_LEN);
    return trimmed.length ? trimmed : 'Anonymous';
}

app.post('/api/scores', (req, res) => {
    const { id, name, score, depth, gems } = req.body || {};
    if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
        return res.status(400).json({ error: 'invalid score' });
    }
    const entry = {
        id: typeof id === 'string' && id ? id : crypto.randomUUID(),
        name: sanitizeName(name),
        score: Math.round(score),
        depth: Number.isFinite(depth) ? Math.round(depth) : 0,
        gems: Number.isFinite(gems) ? Math.round(gems) : 0,
        createdAt: Date.now(),
    };
    insertScore(db, entry);
    res.status(201).json(entry);
});

app.get('/api/scores/top', (req, res) => {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    res.json(getTopScores(db, limit));
});

app.get('/health', (req, res) => res.json({ ok: true }));

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`GemDigger leaderboard API listening on :${PORT}`));
}

export default app;
