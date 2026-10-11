export const DAY_MS = 86_400_000;

/** The instant `days` days before `now`, as ISO 8601. */
export const daysBefore = (now, days) => new Date(now.getTime() - days * DAY_MS).toISOString();
