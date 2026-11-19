# code-challenge — Project Reference

## What This Is
A localhost web app for solving Advent of Code and Project Euler problems in TypeScript. The full
design lives in [SPEC.md](SPEC.md); this file is the technical reference for agents.

## Workflow

```yaml
deployments:
  prod:
    branch: main
# Single-branch, local-only: nothing deploys. Commit to main and push to GitHub
# (github.com/JoeTheDave/code-challenge, public). No CI, no staging, no Fly app.
```

Verification is manual: `npm run typecheck`, then run the app and a solution. There is no
automated test suite yet.

## Intentional Deviations (from ~/.claude/STANDARDS.md)
- **No database, no Prisma.** All state is one committed `progress.json`.
- **One process, one port.** Express with Vite in middleware mode, not a separate client/server.
- **Not deployed.** Localhost only (binds `127.0.0.1`), because it runs arbitrary solution code
  and has full file-system access.
- **Branch is `main`**, not `master` (created that way on the MacBook Air).
- **No tests.** Correctness of solutions is checked against AoC/Euler accepted answers.

## Stack
Node (see `.nvmrc`), TypeScript, Express 5, Vite 8 (middleware mode), React 19, React Router 7,
xterm.js (terminal panel), chokidar (file watching), ws (WebSocket), tsx (runs server and
solutions), lodash-es.

## Repo Structure
```
server/        Express API (api.ts), WebSocket + entry (index.ts), file watcher, runner
               (runner.ts spawns runner-child.ts via tsx), scaffold, site scrapers (sites.ts),
               progress.json + .local/config.json access
web/           React app: pages Home / ProblemPage / Settings, Terminal + TestDrawer, vis page
solutions/     aoc/YYYY/DD/ and euler/NNN/: index.ts, input.txt, test-N.txt, optional vis.ts
lib/           Shared solution helpers, imported as `@/lib/*`
progress.json  All problem state and metadata (committed)
.local/        config.json: AoC session cookie, Euler cookie, contact (gitignored)
```

## Data Model
`progress.json`, keyed by problem id (`aoc/2024/13`, `euler/001`): `name`, AoC
`stars: [bool,bool]` + `answers: [string|null, string|null]`, Euler `solved` + `answer`,
`dataSet`, optional `issue`, `testSets: [{id,name}]` (contents in `test-N.txt` files).

## API Endpoints (all under `/api`)
| Method | Path | Purpose |
|---|---|---|
| GET | `/overview` | Landing-page grids |
| POST | `/aoc/:year/names` | Fetch a year's puzzle names |
| GET | `/problems/:id` | Problem detail |
| POST | `/problems/:id/start` | Scaffold `index.ts`, fetch input, create Test 1 |
| PATCH | `/problems/:id` | Stars/solved/dataSet/issue |
| POST | `/problems/:id/answers/fetch` | Scrape accepted answers |
| POST | `/problems/:id/input/fetch` | Re-fetch AoC input |
| POST / PUT / DELETE | `/problems/:id/tests[/:testId]` | Test-set CRUD |
| POST | `/problems/:id/vis` | Generate `vis.ts` |
| GET | `/problems/:id/data` | Selected data set contents |
| POST | `/problems/:id/open` | Open in VS Code |
| POST | `/problems/:id/run`, `/stop` | Run / stop the solution |
| GET | `/git` | Local vs GitHub sync status (also pushed over `/ws` as `{type:'git'}`) |
| POST | `/git/fetch` | `git fetch` now (`{force:true}`) or if the last one is over a minute old |
| GET / PUT | `/settings` | Settings (secrets are never returned, only `has*` flags) |

## Frontend Routes
`/`, `/aoc/:year/:day`, `/euler/:number`, `/settings`, plus `web/vis.html` for visualizations.

## Environment Variables
- `PORT` (default 5180)
- `NO_OPEN=1` skips opening the browser on start

## Non-Obvious Conventions
- Solution files export `partOne`/`partTwo` (AoC) or `solve` (Euler), take `(input, isTest)`,
  may be async, and carry no status flags in code.
- Secrets live only in `.local/config.json`. Never commit it; `publicSettings()` is the only
  shape the browser sees.
- `npm start` runs `tsx watch`, so editing `server/` restarts the server.

## Tagged Versions
_None yet._
