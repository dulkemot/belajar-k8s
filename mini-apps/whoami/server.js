// Whoami: menampilkan identitas Pod via Downward API.
// Konsep: Kubernetes menyuntik info Pod (nama, IP, node) sebagai environment,
// sehingga aplikasi sadar "di mana ia berjalan" tanpa query API server.
const express = require('express');
const app = express();
app.get('/', (req, res) => {
  const rows = [
    ['Pod', process.env.POD_NAME || '?'],
    ['Namespace', process.env.POD_NAMESPACE || '?'],
    ['Pod IP', process.env.POD_IP || '?'],
    ['Node', process.env.NODE_NAME || '?'],
    ['ServiceAccount', process.env.SA_NAME || '?'],
  ];
  res.send(`<html><body style="font-family:sans-serif;max-width:640px;margin:8vh auto;background:#faf6ef;color:#1c1917">`
    + `<h1>Siapa saya?</h1><table border="1" cellpadding="8" cellspacing="0">`
    + rows.map(r => `<tr><td><b>${r[0]}</b></td><td><code>${r[1]}</code></td></tr>`).join('')
    + `</table><p>Refresh berkali-kali: perhatikan nama Pod berganti (load-balance antar replika).</p></body></html>`);
});
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.listen(3000, '0.0.0.0', () => console.log('whoami on 3000'));
