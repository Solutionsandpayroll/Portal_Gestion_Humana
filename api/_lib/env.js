function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export function getGraphConfig() {
  const tenantId = required('TENANT_ID');
  const clientId = required('CLIENT_ID');
  const clientSecret = required('CLIENT_SECRET');

  // Mantiene compatibilidad si el usuario usa DOCTOR_EMAIL en vez de ENCARGADO_EMAIL.
  const encargadoEmail = (process.env.ENCARGADO_EMAIL || process.env.DOCTOR_EMAIL || '').trim();
  if (!encargadoEmail) {
    throw new Error('Missing required environment variable: ENCARGADO_EMAIL');
  }

  return { tenantId, clientId, clientSecret, encargadoEmail };
}
