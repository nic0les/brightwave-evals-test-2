import assert from "node:assert/strict";
import { test } from "node:test";
import { toRecord } from "../src/connectors/gmail/body.js";

const b64 = (text) => Buffer.from(text, "utf8").toString("base64url");

test("a plain-text email's body is stored", () => {
  const record = toRecord({
    id: "m1",
    threadId: "t1",
    payload: {
      headers: [{ name: "Subject", value: "Renewal" }, { name: "From", value: "a@example.test" }],
      mimeType: "multipart/alternative",
      parts: [
        { mimeType: "text/plain", body: { data: b64("See you Tuesday.") } },
        { mimeType: "text/html", body: { data: b64("<p>See you Tuesday.</p>") } },
      ],
    },
  });
  assert.equal(record.subject, "Renewal");
  assert.equal(record.body, "See you Tuesday.");
});

test("attachment names are kept", () => {
  const record = toRecord({ id: "m2", threadId: "t2", payload: { mimeType: "multipart/mixed", parts: [{ mimeType: "text/plain", body: { data: b64("Attached.") } }, { filename: "terms.pdf", mimeType: "application/pdf", body: {} }] } });
  assert.deepEqual(record.attachments, ["terms.pdf"]);
});
