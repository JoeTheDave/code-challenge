# code-challenge — Spec

A localhost web app for working on [Advent of Code](https://adventofcode.com/) and
[Project Euler](https://projecteuler.net/archives) problems in TypeScript. It's meant to sit on one
side of the screen with a code editor on the other: every save re-runs the solution and shows
the output in a terminal panel.

## Stack

- Express server + Vite (middleware mode) + React, all TypeScript, one process, one port.
- Binds to `127.0.0.1` only. Has full file-system access.
- `npm start` starts everything and opens the app in the browser.
- Solutions are TypeScript only. They run in a child process via `tsx`.

## Repository layout

```
server/        Express API, WebSocket, file watcher, solution runner, site scrapers
web/           React app (landing page, puzzle page, settings) + visualization page
solutions/     aoc/YYYY/DD/…  and  euler/NNN/…
lib/           Shared helpers for solutions, imported as `@/lib/*`
progress.json  Central state and metadata for all problems (committed)
.local/        Gitignored local config (session cookies)
```

## Problems and state

Problem ids: `aoc/2024/13`, `euler/001`. Each id is also its folder under `solutions/`.

All state and metadata live in one committed `progress.json`, keyed by problem id:

- `name`: problem title (prefetched, see below)
- AoC: `stars: [bool, bool]`, `answers: [string | null, string | null]`
- Euler: `solved: bool`, `answer: string | null`
- `dataSet`: the selected data set (`input` or a test-set id)
- `issue`: optional reason a solution is known to be broken. Flagged problems get a red marker on
  the grid and an issue count on collapsed groups; the puzzle page shows the reason with a
  **Mark resolved** button that clears it.
- `testSets: [{ id, name }]`: test data contents are stored as files (`test-1.txt`, …) in the
  problem folder

States:

- AoC: **Not Started** → **Started** (solution files exist) → **★** → **★★**
- Euler: **Not Started** → **Started** → **Solved**

Completion is marked by hand in the app (★1 / ★2 toggles for AoC, Solved toggle for Euler).
The app does not scrape completion status. When a star or Solved is turned on, the app scrapes
the accepted answer from the site (logged-in session required) and stores it. A stored answer
lets the output panel mark Puzzle Input runs ✓/✗. If the scrape fails, the toggle still
saves, a warning is shown, and the answer can be re-fetched or entered by hand.

## Names

- Euler: all names come from one request to `https://projecteuler.net/minimal=problems`. This
  also gives the total problem count.
- AoC: a year's names are fetched (one page per day, throttled) the first time that year's grid
  is expanded.
- Names are stored permanently in `progress.json`.

## Solution files

```ts
// solutions/aoc/2024/13/index.ts
export const partOne = (input: string) => { … }
export const partTwo = (input: string) => { … }

// solutions/euler/001/index.ts
export const solve = (input: string) => { … }
```

- No status or data flags in code.
- The runner passes the selected data set's contents as `input`, with one trailing newline
  removed.
- A second argument, `isTest`, is true when a test set is selected (for puzzles whose
  parameters differ between the example and the real input).
- Functions may be async.
- `console.log` output streams to the terminal panel.
- Each part's return value, run time and a Copy button are shown separately.

## Data

- AoC puzzle input is fetched on **Start** (needs the AoC session cookie) and saved to
  `input.txt`. It can be re-fetched.
- Test data: the **Test Data** button opens a drawer that slides in from the right. It starts
  with one text area. **+ Add test set** adds more. Sets can be renamed and deleted, and edits
  autosave.
- A data-set selector lists **Puzzle Input** (AoC, or Euler when `input.txt` exists) plus each
  test set. Changing it re-runs the solution, and the choice is saved per problem.

## Landing page

- One grid per AoC year (2015 → current; 25 days through 2024, 12 days from 2025). Days that
  haven't unlocked yet are disabled.
- One grid per 100 Euler problems.
- All grids are collapsed by default. Collapsed grids show solved / total.
- Each cell shows the problem number, its state, and the problem name on hover.

## Puzzle page

- Header with the problem name and links to the puzzle page (and the input page for AoC).
- **Open in VS Code**: opens the repo with the solution file focused (`code <repo> -g <file>`).
- Not started: a **Start** button generates `index.ts`, fetches the input (AoC) and creates
  an empty Test 1.
- Started: star / Solved toggles, data-set selector, Run / Stop, Test Data drawer, results
  panel and terminal (xterm.js).
- File watching: changes in the problem folder or `lib/` re-run the solution. A new run
  kills any run in progress.
- Visualization: **Generate Visualization File** creates `vis.ts` exporting
  `visualize(canvas, input)`. The button then becomes **Launch Visualization**, which opens a
  new tab with a canvas. Vite reloads that tab whenever `vis.ts` is saved.

## Settings

- AoC `session` cookie value.
- Project Euler cookie string (used for answer scraping).
- Optional contact info for the User-Agent header sent to the sites.
- Stored in `.local/config.json` (gitignored).

## Migration

Solutions from the old `advent-of-code` project were migrated on 2026-11-18 (114 AoC days, 57
Euler problems), verified against AoC's accepted answers and the old code's output.
