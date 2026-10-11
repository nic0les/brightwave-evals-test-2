# Notes for coding agents

- Code is plain ES modules, no dependencies. Tests use `node:test` and live in `tests/`; run `npm test`.
- Connectors turn a source's API responses into records. Each has a pure function that is easy to
  test with a fake API (see the tests for the pattern).
- Keep changes small and in the style of the file. Add a test for every behaviour you change.
- Never put real people's names, emails or amounts in tests: use made-up values.
