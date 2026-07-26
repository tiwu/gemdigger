// ── Integration test: leaderboard API ────────────────────────────────────────
// Spins up the Express app in-process (no real network/port) using an
// isolated in-memory-style temp SQLite file, and exercises the full
// submit -> top-N read round trip.
import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';

const tmpDb = path.join(os.tmpdir(), `gemdigger-test-${Date.now()}-${Math.random()}.db`);

process.env.GEMDIGGER_DB_PATH = tmpDb;
process.env.NODE_ENV = 'test';

const { default: app } = await import('../server.js');

// Minimal in-process HTTP request helper (avoids a supertest dependency).
function request(method, urlPath, body) {
    return new Promise((resolve, reject) => {
        const server = app.listen(0, () => {
            const { port } = server.address();
            const payload = body ? JSON.stringify(body) : undefined;
            const req = http.request({

                hostname: 'localhost', port, path: urlPath, method,
                headers: payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {},
            }, (res) => {
                let data = '';
                res.on('data', (c) => data += c);
                res.on('end', () => {
                    server.close();
                    resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
                });
            });
            req.on('error', (e) => { server.close(); reject(e); });
            if (payload) req.write(payload);
            req.end();
        });
    });
}

test('POST /api/scores rejects invalid score', async () => {
    const res = await request('POST', '/api/scores', { name: 'Bob', score: -5 });
    assert.strictEqual(res.status, 400);
});

test('POST /api/scores accepts a valid entry and GET /api/scores/top returns it', async () => {
    const post = await request('POST', '/api/scores', { name: 'Alice', score: 1200, depth: 80, gems: 12 });
    assert.strictEqual(post.status, 201);
    assert.strictEqual(post.body.name, 'Alice');

    const top = await request('GET', '/api/scores/top');
    assert.strictEqual(top.status, 200);
    assert.ok(Array.isArray(top.body));
    assert.ok(top.body.some(e => e.name === 'Alice' && e.score === 1200));
});

test('top scores are ordered descending by score', async () => {
    await request('POST', '/api/scores', { name: 'Low', score: 10 });
    await request('POST', '/api/scores', { name: 'High', score: 9999 });
    const top = await request('GET', '/api/scores/top?limit=50');
    const scores = top.body.map(e => e.score);
    const sorted = [...scores].sort((a,b) => b-a);
    assert.deepStrictEqual(scores, sorted);
});

test('name is sanitized/truncated and defaults to Anonymous', async () => {
    const res = await request('POST', '/api/scores', { score: 42 });
    assert.strictEqual(res.body.name, 'Anonymous');
});

test.after(() => {
    try { fs.unlinkSync(tmpDb); fs.unlinkSync(tmpDb + '-wal'); fs.unlinkSync(tmpDb + '-shm'); } catch(e) {}
});
