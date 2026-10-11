# Brightwave agent (test repository)

A small stand-in for the agent Brightwave Analytics runs ("Dex", an AI work assistant that answers
staff questions from the company's connected tools). It exists to test Improve's git connector end
to end: Improve reads the prompt, skill and tool definitions as the agent's profile, cites the
connector code in its diagnoses, and opens draft pull requests for accepted fixes.

Everything here is synthetic. The connectors are simplified versions of real ones, with the same
behaviour the Brightwave eval world is built around (see `AGENTS.md`).

```
prompts/system.md                 the agent's system prompt
skills/context_system/SKILL.md    how it answers from the company's context
tools/*.json                      the tools it calls (source_search, source_get)
config/connections.json           connection settings (Slack channels, calendar lookahead)
src/connectors/                   Gmail, Google Calendar and Slack sync code
tests/                            node --test
```

Run the tests with `npm test` (Node 20 or later, no dependencies).
