const express = require('express');
const { Pool } = require('pg');
const Redis = require('ioredis');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

function parsePort(v, fb) {
  if (typeof v === 'string' && /^\d+$/.test(v.trim())) return parseInt(v.trim(), 10);
  return fb;
}

const pg = new Pool({
  host: process.env.PGHOST, port: parsePort(process.env.PGPORT, 5432),
  user: process.env.PGUSER, password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE, connectionTimeoutMillis: 3000,
});
const redis = new Redis({
  host: process.env.REDIS_HOST, port: parsePort(process.env.REDIS_PORT, 6379),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 2, enableOfflineQueue: false,
  retryStrategy: (t) => Math.min(t * 200, 2000),
});
redis.on('error', () => {});

pg.query(`CREATE TABLE IF NOT EXISTS notes (
  id serial primary key, pesan text NOT NULL, dibuat timestamptz default now()
)`).then(() => console.log('tabel notes siap')).catch(e => console.error('tabel gagal:', e.message));

async function depStatus() {
  let pgS = 'down', rdS = 'down';
  try { await pg.query('SELECT 1'); pgS = 'up'; } catch {}
  try { if ((await redis.ping()) === 'PONG') rdS = 'up'; } catch {}
  return { postgres: pgS, redis: rdS };
}

app.get('/api/health', async (req, res) => {
  const s = await depStatus();
  res.json({ status: s.postgres === 'up' ? 'ok' : 'degraded', ...s, time: new Date().toISOString() });
});

app.get('/api/notes', async (req, res) => {
  try {
    const cached = await redis.get('notes:list');
    if (cached) { res.set('X-Cache', 'HIT'); return res.json(JSON.parse(cached)); }
    const r = await pg.query('SELECT id, pesan, dibuat FROM notes ORDER BY id DESC LIMIT 20');
    await redis.set('notes:list', JSON.stringify(r.rows), 'EX', 30);
    res.set('X-Cache', 'MISS');
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/notes', async (req, res) => {
  const pesan = (req.body && req.body.pesan || '').toString().slice(0, 500);
  if (!pesan) return res.status(400).json({ error: 'field "pesan" wajib diisi' });
  try {
    const r = await pg.query('INSERT INTO notes (pesan) VALUES ($1) RETURNING *', [pesan]);
    await redis.del('notes:list');
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, '0.0.0.0', () => console.log(`apidb listening on ${PORT}`));
