/**
 * Servidor local de desarrollo para las funciones serverless de /api/.
 * Úsalo junto con `npm run dev` (Vite) ejecutando:
 *   node dev-api.js
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import loginHandler from './api/login.js';

// ─── Cargar .env manualmente ────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    process.env[key] = value;
  }
}

// ─── Servidor HTTP ───────────────────────────────────────────────────────────
const PORT = 3001;

const server = http.createServer((req, res) => {
  // CORS para desarrollo local
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/login') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      let parsed = {};
      try { parsed = JSON.parse(body); } catch { /* body inválido */ }

      // Simula el objeto req/res de Vercel
      const mockReq = { method: req.method, body: parsed };
      const mockRes = {
        _status: 200,
        status(code) { this._status = code; return this; },
        json(data) {
          res.writeHead(this._status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
        },
      };

      loginHandler(mockReq, mockRes);
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`✅ API dev server corriendo en http://localhost:${PORT}`);
  console.log('   Proxy activo: /api/login → disponible');
});
