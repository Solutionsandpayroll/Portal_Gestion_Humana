import { createAppointment } from './_lib/calendarService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nombre, correo, fecha, hora, duracionMinutos } = req.body || {};

    if (!nombre || !correo || !fecha || !hora) {
      return res.status(400).json({
        error: 'Campos obligatorios: nombre, correo, fecha, hora, duracionMinutos(opcional).',
      });
    }

    const duration = Number(duracionMinutos || 60);
    if (!Number.isFinite(duration) || duration <= 0 || duration > 240) {
      return res.status(400).json({ error: 'duracionMinutos debe estar entre 1 y 240.' });
    }

    const result = await createAppointment({
      nombre: String(nombre),
      correo: String(correo),
      fecha: String(fecha),
      hora: String(hora),
      duracionMinutos: duration,
    });

    return res.status(201).json(result);
  } catch (error) {
    if (error?.code === 'SLOT_TAKEN') {
      return res.status(409).json({ error: error.message });
    }
    console.error('appointments error', error);
    return res.status(500).json({ error: 'No fue posible crear la cita.' });
  }
}
