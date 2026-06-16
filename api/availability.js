import { getScheduleForRange } from './_lib/calendarService.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Evita cache del navegador/CDN para mostrar disponibilidad fresca.
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const { start, end } = req.query || {};
    if (!start || !end) {
      return res.status(400).json({ error: 'Query params start y end son obligatorios.' });
    }

    const data = await getScheduleForRange(String(start), String(end));
    return res.status(200).json(data);
  } catch (error) {
    console.error('availability error', error);
    return res.status(500).json({ error: 'No fue posible consultar disponibilidad.' });
  }
}
