/** A header's value, by name (case-insensitive). */
export const header = (headers, name) => headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? null;

/** The first part of a message with this MIME type, decoded; null when there's none. */
export function findBody(part, mimeType = "text/plain") {
  if (part.mimeType === mimeType && part.body?.data) return Buffer.from(part.body.data, "base64url").toString("utf8");
  for (const child of part.parts ?? []) {
    const found = findBody(child, mimeType);
    if (found) return found;
  }
  return null;
}

/** A Gmail API message as a record: subject, sender, date, the text body and attachment names. */
export function toRecord(message) {
  const headers = message.payload?.headers ?? [];
  return {
    id: `gmail:${message.id}`,
    thread_id: message.threadId,
    subject: header(headers, "Subject") ?? "",
    from: header(headers, "From"),
    date: header(headers, "Date"),
    body: findBody(message.payload ?? {}) ?? "",
    attachments: attachments(message.payload ?? {}),
  };
}

function attachments(part) {
  return [...(part.filename ? [part.filename] : []), ...(part.parts ?? []).flatMap(attachments)];
}
