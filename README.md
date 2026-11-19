# code-challenge

A localhost web app for solving [Advent of Code](https://adventofcode.com/) and
[Project Euler](https://projecteuler.net/archives) problems in TypeScript. Keep it open next to
your editor: every save re-runs the solution and streams the output. See [SPEC.md](SPEC.md) for
the full design.

## Usage

```sh
npm install
npm start          # opens http://localhost:5180 (set NO_OPEN=1 to skip); restarts when server/ code changes
```

1. Open **Settings** and paste your Advent of Code `session` cookie, plus your Project Euler cookies
   if you want accepted answers fetched.
2. Expand a year or block of problems on the landing page and click a problem.
3. **Start** creates `solutions/<id>/index.ts`, fetches the AoC input and creates an empty test set.
4. Edit the solution in your editor. Saving re-runs it.
5. Submit the answer on the puzzle site, then mark the star (or Solved). The accepted answer is
   fetched and shown with ✓/✗ on future Puzzle Input runs.

## Layout

| Path            | What                                                          |
| --------------- | ------------------------------------------------------------- |
| `server/`       | Express API, WebSocket, file watcher, runner, site scrapers   |
| `web/`          | React app and the visualization page                          |
| `solutions/`    | `aoc/YYYY/DD/` and `euler/NNN/`: `index.ts`, `input.txt`, `test-N.txt`, `vis.ts` |
| `lib/`          | Shared helpers, importable from solutions as `@/lib/…`        |
| `progress.json` | Names, stars / solved, answers, selected data set, test sets  |
| `.local/`       | Session cookies (gitignored)                                  |
