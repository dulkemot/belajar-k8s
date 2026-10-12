const express = require('express');
const Redis = require('ioredis');
const os = require('os');
const app = express();
const redis = new Redis({
  host: process.env.REDIS_HOST || '192.168.0.103',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 2,
  retryStrategy: (t) => Math.min(t * 200, 2000),
});
redis.on('error', () => {});
app.get('/', async (req, res) => {
  try {
    const n = await redis.incr('counter:hits');
    res.send(`<html><body style="font-family:sans-serif;text-align:center;padding-top:15vh;background:#faf6ef;color:#1c1917">`
      + `<h1>Kunjungan ke-${n}</h1><p>Dilayani oleh Pod <code>${os.hostname()}</code></p>`
      + `<p>Counter tersimpan di Redis CT-DB (.103) &mdash; restart Pod tidak menghilangkannya.</p>`
      + `<p><a href="/">Muat ulang untuk +1</a></p></body></html>`);
  } catch (e) { res.status(500).send('Redis belum terjangkau: ' + e.message); }
});
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.listen(3000, '0.0.0.0', () => console.log('counter on 3000'));
