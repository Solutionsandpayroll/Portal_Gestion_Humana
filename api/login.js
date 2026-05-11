import crypto from 'crypto';

/**
 * Crea un JWT firmado con HMAC-SHA256.
 * El token expira en 8 horas.
 */
function createToken(username, secret) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${sig}`;
}

export default function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body ?? {};

  // Validaciones básicas de input
  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ error: 'Nombre de usuario requerido.' });
  }
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Contraseña requerida.' });
  }

  const APP_PASSWORD = process.env.APP_PASSWORD ?? '';
  const APP_JWT_SECRET = process.env.APP_JWT_SECRET;

  if (!APP_PASSWORD || !APP_JWT_SECRET) {
    console.error('Variables de entorno APP_PASSWORD o APP_JWT_SECRET no configuradas.');
    return res.status(500).json({ error: 'Error de configuración del servidor.' });
  }

  // Comparación en tiempo constante para evitar timing attacks
  let passwordsMatch = false;
  try {
    const pwdBuffer = Buffer.from(password);
    const validBuffer = Buffer.from(APP_PASSWORD);
    if (pwdBuffer.length === validBuffer.length) {
      passwordsMatch = crypto.timingSafeEqual(pwdBuffer, validBuffer);
    }
  } catch {
    passwordsMatch = false;
  }

  if (!passwordsMatch) {
    return res.status(401).json({ error: 'Contraseña incorrecta. Verifica con el administrador del portal.' });
  }

  const token = createToken(username.trim(), APP_JWT_SECRET);
  return res.status(200).json({ token, username: username.trim() });
}
