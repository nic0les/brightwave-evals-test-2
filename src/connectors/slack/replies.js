import { daysBefore } from "../../util.js";

/**
 * Since when a channel's thread replies are fetched: after the last reply seen, or on a channel's
 * first sweep, the thread lookback.
 */
export function replyGate(channel, config, now) {
  return channel.replyTs ?? daysBefore(now, config.threadLookbackDays ?? 30);
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
