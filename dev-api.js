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
import availabilityHandler from './api/availability.js';
import appointmentsHandler from './api/appointments.js';

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
  const makeMockRes = () => {
    const headers = { 'Content-Type': 'application/json' };
    return {
      _status: 200,
      setHeader(name, value) {
        headers[name] = value;
      },
      status(code) {
        this._status = code;
        return this;
      },
      json(data) {
        res.writeHead(this._status, headers);
        res.end(JSON.stringify(data));
      },
    };
  };

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
      const mockRes = makeMockRes();

      loginHandler(mockReq, mockRes);
    });
    return;
  }

  if (req.method === 'GET' && req.url?.startsWith('/api/availability')) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const query = Object.fromEntries(url.searchParams.entries());
    const mockReq = { method: req.method, query };
    const mockRes = makeMockRes();
    Promise.resolve(availabilityHandler(mockReq, mockRes)).catch((error) => {
      console.error('Error en /api/availability', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error interno del servidor.' }));
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/appointments') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      let parsed = {};
      try { parsed = JSON.parse(body); } catch { /* body inválido */ }

      const mockReq = { method: req.method, body: parsed };
      const mockRes = makeMockRes();

      Promise.resolve(appointmentsHandler(mockReq, mockRes)).catch((error) => {
        console.error('Error en /api/appointments', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error interno del servidor.' }));
      });
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`✅ API dev server corriendo en http://localhost:${PORT}`);
  console.log('   Proxy activo: /api/login, /api/availability, /api/appointments → disponibles');
});
