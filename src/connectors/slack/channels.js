/** The channels a sweep reads: those selected in the connection settings that the account is in. */
export function sweptChannels(channels, config) {
  const selected = new Set(config.selectChannels ?? []);
  return channels.filter((c) => selected.has(c.id) && c.is_member);
}
