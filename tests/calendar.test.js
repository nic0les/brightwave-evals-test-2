import assert from "node:assert/strict";
import { test } from "node:test";
import { syncCalendar, syncWindow } from "../src/connectors/google-calendar/sync.js";

/** A Calendar API that serves events overlapping the requested window, as Google's does. */
const fakeCalendar = (events) => ({
  async listEvents(_calendarId, params) {
    return events.filter((e) => e.end.dateTime > params.timeMin && e.start.dateTime < params.timeMax);
  },
});

const NOW = new Date("2026-10-02T16:40:00.000Z");
const at = (iso, hours = 1) => ({ dateTime: iso, end: new Date(Date.parse(iso) + hours * 3_600_000).toISOString() });
const event = (id, startIso) => ({ id, summary: `Meeting ${id}`, start: { dateTime: startIso }, end: { dateTime: at(startIso).end } });

test("a pass reads the lookback window", () => {
  const window = syncWindow({ lookbackDays: 90 }, NOW);
  assert.equal(window.windowStart, "2026-07-04T16:40:00.000Z");
});

test("a retried pass keeps the window it started with", () => {
  const window = syncWindow({}, NOW, { retry: true, windowStart: "a", windowEnd: "b" });
  assert.deepEqual(window, { windowStart: "a", windowEnd: "b" });
});

test("past meetings are synced as records", async () => {
  const api = fakeCalendar([event("e1", "2026-09-30T17:00:00.000Z"), event("e2", "2026-10-01T15:00:00.000Z")]);
  const { records } = await syncCalendar(api, { calendarId: "primary", config: { lookbackDays: 90 } }, NOW);
  assert.deepEqual(records.map((r) => r.id), ["calendar:primary:e1", "calendar:primary:e2"]);
});

test("cancelled events are dropped", async () => {
  const api = fakeCalendar([{ ...event("e3", "2026-10-01T15:00:00.000Z"), status: "cancelled" }]);
  const { records } = await syncCalendar(api, { calendarId: "primary", config: {} }, NOW);
  assert.equal(records.length, 0);
});
