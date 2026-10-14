import { daysBefore } from "../../util.js";

/**
 * Since when a channel's thread replies are fetched: after the last reply seen, or on a channel's
 * first sweep, the message lookback, so every thread whose parent is synced also gets its replies.
 */
export function replyGate(channel, config, now) {
  return channel.replyTs ?? daysBefore(now, config.lookbackDays ?? 90);
}

/** The replies of the threads in a channel newer than the gate. */
export async function syncReplies(api, channel, config, now) {
  const since = replyGate(channel, config, now);
  const threads = await api.threads(channel.id);
  const replies = [];
  for (const thread of threads) {
    if (thread.latestReply < since) continue;
    replies.push(...(await api.replies(channel.id, thread.ts)));
  }
  return replies;
}
