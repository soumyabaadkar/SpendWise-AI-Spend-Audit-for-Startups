# TESTS.md

All tests are in `tests/auditEngine.test.ts` and run with Vitest.

## How to run

```bash
npm test          # run all tests
npm run test -- --watch   # watch mode
npm run test -- --coverage  # with coverage report
```

CI runs `npm test` on every push to `main` via `.github/workflows/ci.yml`.

## Test list

| File | Test | What it covers |
|---|---|---|
| `tests/auditEngine.test.ts` | recommends downgrade from Team to Plus for ≤2 seats | Core ChatGPT downgrade rule: Team plan is wasteful for 1-2 users |
| `tests/auditEngine.test.ts` | does NOT recommend downgrade for Team with 5 seats | Rule boundary: 5 seats is the correct threshold for Team |
| `tests/auditEngine.test.ts` | recommends downgrade from Enterprise for ≤5 seats | ChatGPT Enterprise overkill rule |
| `tests/auditEngine.test.ts` | recommends downgrade from Business to Pro for ≤3 seats | Cursor Business → Pro rule; validates exact savings amount |
| `tests/auditEngine.test.ts` | keeps Cursor Business optimal for 10 seats | Cursor rule boundary: Business is correct at scale |
| `tests/auditEngine.test.ts` | recommends downgrade from Enterprise to Business for ≤5 seats | Copilot Enterprise → Business downgrade |
| `tests/auditEngine.test.ts` | correctly sums savings across multiple tools | Multi-tool total: monthlySavings, annualSavings, savingsPercentage |
| `tests/auditEngine.test.ts` | returns optimal tier when no savings found | Zero-savings path: tier = 'optimal', savings = 0 |
| `tests/auditEngine.test.ts` | returns high tier when savings exceed $500/mo | High-savings tier classification |
| `tests/auditEngine.test.ts` | recommends downgrade from Max when spend is far above Pro baseline | Claude Max → Pro rule triggers correctly |

## Notes

- The audit engine is pure TypeScript with no external dependencies, making it trivially testable without mocks.
- All rules have both a positive test (fires correctly) and a boundary/negative test (does not fire when not applicable).
- API calls (Anthropic, Supabase) are not tested here — they are integration concerns covered by manual smoke testing on the deployed URL.
