import assert from "node:assert/strict";
import { test } from "node:test";
import { sweptChannels } from "../src/connectors/slack/channels.js";
import { replyGate, syncReplies } from "../src/connectors/slack/replies.js";

const NOW = new Date("2026-10-02T16:40:00.000Z");

test("only selected channels the account is in are swept", () => {
  const channels = [{ id: "C1", is_member: true }, { id: "C2", is_member: true }, { id: "C3", is_member: false }];
  assert.deepEqual(sweptChannels(channels, { selectChannels: ["C1", "C3"] }).map((c) => c.id), ["C1"]);
});

test("a channel seen before reads replies after its last reply", () => {
  assert.equal(replyGate({ replyTs: "2026-09-30T00:00:00.000Z" }, {}, NOW), "2026-09-30T00:00:00.000Z");
});

test("recent thread replies are synced", async () => {
  const api = {
    threads: async () => [{ ts: "1", latestReply: "2026-09-28T10:00:00.000Z" }],
    replies: async () => [{ ts: "1.1", text: "Confirmed." }],
  };
  assert.deepEqual(await syncReplies(api, { id: "C1" }, {}, NOW), [{ ts: "1.1", text: "Confirmed." }]);
});

test("a first sweep syncs replies of older threads inside the message lookback", async () => {
  const api = {
    threads: async () => [
      { ts: "1", latestReply: "2026-08-18T09:00:00.000Z" },
      { ts: "2", latestReply: "2026-06-01T09:00:00.000Z" },
    ],
    replies: async (_channel, ts) => [{ ts: `${ts}.1`, text: "Approved." }],
  };
  const config = { lookbackDays: 90, threadLookbackDays: 30 };
  assert.deepEqual(await syncReplies(api, { id: "C1" }, config, NOW), [{ ts: "1.1", text: "Approved." }]);
});
