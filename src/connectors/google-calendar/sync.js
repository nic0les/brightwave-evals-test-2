import { daysAfter, daysBefore } from "../../util.js";

/**
 * The events window of one sync pass: from the lookback start to the lookahead end, so upcoming
 * events (and changes to them) are re-read on every pass. A pass that failed part-way retries with
 * the window it started with.
 */
export function syncWindow(config, now, current = {}) {
  if (current.retry && current.windowStart && current.windowEnd) return { windowStart: current.windowStart, windowEnd: current.windowEnd };
  return {
    windowStart: daysBefore(now, config.lookbackDays ?? 90),
    windowEnd: daysAfter(now, config.lookaheadDays ?? 60),
  };
}

/** The Calendar API's events.list parameters for a window. */
export function listParams(window) {
  return { singleEvents: true, orderBy: "startTime", maxResults: 2500, showDeleted: true, timeMin: window.windowStart, timeMax: window.windowEnd };
}

/** An API event as a record: who, what, when. Cancelled events are dropped. */
export function toRecord(calendarId, event) {
  if (event.status === "cancelled") return null;
  return {
    id: `calendar:${calendarId}:${event.id}`,
    title: event.summary ?? "(no title)",
    start: event.start?.dateTime ?? event.start?.date ?? null,
    end: event.end?.dateTime ?? event.end?.date ?? null,
    attendees: (event.attendees ?? []).map((a) => ({
      email: a.email,
      displayName: a.displayName ?? null,
      responseStatus: a.responseStatus ?? "needsAction",
    })),
    description: event.description ?? "",
  };
}

/** One pass over a calendar: the events in the window, as records. */
export async function syncCalendar(api, connection, now, current = {}) {
  const window = syncWindow(connection.config ?? {}, now, current);
  const events = await api.listEvents(connection.calendarId, listParams(window));
  return { window, records: events.map((e) => toRecord(connection.calendarId, e)).filter(Boolean) };
}
