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
