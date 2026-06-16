import { getGraphConfig } from './env.js';
import { graphRequest } from './graphClient.js';

const SLOT_MINUTES = 30;
const WORK_START_HOUR = 8;
const WORK_END_HOUR = 18;

function pad(n) {
  return String(n).padStart(2, '0');
}

function toIsoLocalDateTime(date, time) {
  return `${date}T${time}:00`;
}

function normalizeIsoLocal(input) {
  // Mantiene formato local YYYY-MM-DDTHH:mm:ss sin zona horaria.
  return String(input).trim().slice(0, 19);
}

function isoLocalToMs(isoLocal) {
  const iso = normalizeIsoLocal(isoLocal);
  const [datePart, timePart] = iso.split('T');
  if (!datePart || !timePart) return Number.NaN;

  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm, ss] = timePart.split(':').map(Number);
  if ([y, m, d, hh, mm].some((v) => Number.isNaN(v))) return Number.NaN;

  // Date.UTC se usa como referencia neutra para comparar/sumar sin depender de la TZ del servidor.
  return Date.UTC(y, m - 1, d, hh, mm, Number.isNaN(ss) ? 0 : ss, 0);
}

function msToIsoLocal(ms) {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

function addMinutesToIsoLocal(isoLocal, minutes) {
  const baseMs = isoLocalToMs(isoLocal);
  return msToIsoLocal(baseMs + minutes * 60 * 1000);
}

function isSlotWithinWorkingHours(startIso, endIso) {
  const start = normalizeIsoLocal(startIso);
  const end = normalizeIsoLocal(endIso);

  const [startDate] = start.split('T');
  const [endDate] = end.split('T');
  if (startDate !== endDate) return false;

  const [startHour, startMinute] = start.split('T')[1].split(':').map(Number);
  const [endHour, endMinute] = end.split('T')[1].split(':').map(Number);
  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;

  return startTotal >= WORK_START_HOUR * 60 && endTotal <= WORK_END_HOUR * 60;
}

function mergeBusyRanges(ranges) {
  const normalized = ranges
    .map((r) => ({
      start: normalizeIsoLocal(r.start),
      end: normalizeIsoLocal(r.end),
      status: r.status || 'busy',
      source: r.source || 'unknown',
    }))
    .filter((r) => r.start < r.end)
    .sort((a, b) => a.start.localeCompare(b.start));

  if (normalized.length === 0) return [];

  const merged = [normalized[0]];
  for (let i = 1; i < normalized.length; i++) {
    const prev = merged[merged.length - 1];
    const cur = normalized[i];
    if (cur.start <= prev.end) {
      if (cur.end > prev.end) prev.end = cur.end;
      prev.status = prev.status === 'busy' ? prev.status : cur.status;
    } else {
      merged.push(cur);
    }
  }

  return merged.map((r) => ({
    start: r.start,
    end: r.end,
    status: r.status,
    source: r.source,
  }));
}

function busyFromScheduleItems(schedule) {
  return (schedule?.scheduleItems || [])
    .filter((it) => it?.start?.dateTime && it?.end?.dateTime)
    .filter((it) => (it.status || '').toLowerCase() !== 'free')
    .map((it) => ({
      start: it.start.dateTime,
      end: it.end.dateTime,
      status: it.status || 'busy',
      subject: it.subject || '',
      source: 'scheduleItems',
    }));
}

function busyFromAvailabilityView(schedule, startIso) {
  const view = String(schedule?.availabilityView || '');
  if (!view) return [];
  const start = normalizeIsoLocal(startIso);

  const ranges = [];
  let i = 0;
  while (i < view.length) {
    if (view[i] === '0') {
      i += 1;
      continue;
    }

    const startIndex = i;
    while (i < view.length && view[i] !== '0') i += 1;

    const rangeStart = addMinutesToIsoLocal(start, startIndex * SLOT_MINUTES);
    const rangeEnd = addMinutesToIsoLocal(start, i * SLOT_MINUTES);
    ranges.push({
      start: rangeStart,
      end: rangeEnd,
      status: 'busy',
      source: 'availabilityView',
    });
  }

  return ranges;
}

export async function getScheduleForRange(startIso, endIso) {
  const { encargadoEmail } = getGraphConfig();
  const normalizedStart = normalizeIsoLocal(startIso);
  const normalizedEnd = normalizeIsoLocal(endIso);

  const payload = {
    schedules: [encargadoEmail],
    startTime: { dateTime: normalizedStart, timeZone: 'America/Bogota' },
    endTime: { dateTime: normalizedEnd, timeZone: 'America/Bogota' },
    availabilityViewInterval: SLOT_MINUTES,
  };

  const data = await graphRequest(`/users/${encodeURIComponent(encargadoEmail)}/calendar/getSchedule`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const schedule = data?.value?.[0] || {};
  const busy = mergeBusyRanges([
    ...busyFromScheduleItems(schedule),
    ...busyFromAvailabilityView(schedule, normalizedStart),
  ]);

  const available = buildAvailableSlots(normalizedStart, normalizedEnd, schedule, busy);
  return { encargadoEmail, busy, available };
}

function buildAvailableSlots(startIso, endIso, schedule, busyRanges) {
  const availabilityView = String(schedule?.availabilityView || '');
  const rangeStartMs = isoLocalToMs(startIso);
  const rangeEndMs = isoLocalToMs(endIso);
  const available = [];

  for (let index = 0; ; index += 1) {
    const slotStartMs = rangeStartMs + index * SLOT_MINUTES * 60 * 1000;
    const slotEndMs = slotStartMs + SLOT_MINUTES * 60 * 1000;
    if (slotEndMs > rangeEndMs) break;

    const slotStart = msToIsoLocal(slotStartMs);
    const slotEnd = msToIsoLocal(slotEndMs);

    // 1) Estado por availabilityView (fuente principal)
    const viewState = availabilityView[index] || '0';
    if (viewState !== '0') continue;

    // 2) Ventana laboral
    if (!isSlotWithinWorkingHours(slotStart, slotEnd)) continue;

    // 3) Doble validación con rangos ocupados fusionados
    const overlapsBusy = busyRanges.some((b) => slotStart < b.end && slotEnd > b.start);
    if (!overlapsBusy) {
      available.push({ start: slotStart, end: slotEnd });
    }
  }

  return available;
}

export async function verifyAvailability(startIso, endIso) {
  const normalizedStart = normalizeIsoLocal(startIso);
  const normalizedEnd = normalizeIsoLocal(endIso);
  const { busy } = await getScheduleForRange(normalizedStart, normalizedEnd);
  return !busy.some((b) => normalizedStart < b.end && normalizedEnd > b.start);
}

export async function createAppointment({ nombre, correo, fecha, hora, duracionMinutos }) {
  const { encargadoEmail } = getGraphConfig();

  const startIso = toIsoLocalDateTime(fecha, hora);
  const endIso = addMinutesToIsoLocal(startIso, duracionMinutos);

  const isFree = await verifyAvailability(startIso, endIso);
  if (!isFree) {
    const error = new Error('El horario seleccionado ya no está disponible.');
    error.code = 'SLOT_TAKEN';
    throw error;
  }

  const eventPayload = {
    subject: `People Cuidado - ${nombre}`,
    body: {
      contentType: 'HTML',
      content: `Cita agendada desde Portal PEOPLE.<br/>Nombre: ${nombre}<br/>Correo: ${correo}`,
    },
    start: {
      dateTime: startIso,
      timeZone: 'America/Bogota',
    },
    end: {
      dateTime: endIso,
      timeZone: 'America/Bogota',
    },
    attendees: [
      {
        emailAddress: { address: correo, name: nombre },
        type: 'required',
      },
    ],
    isOnlineMeeting: true,
    onlineMeetingProvider: 'teamsForBusiness',
  };

  const event = await graphRequest(`/users/${encodeURIComponent(encargadoEmail)}/events`, {
    method: 'POST',
    body: JSON.stringify(eventPayload),
  });

  return {
    eventId: event.id,
    teamsMeetingUrl: event?.onlineMeeting?.joinUrl || event?.onlineMeetingUrl || '',
    fecha,
    hora,
  };
}
