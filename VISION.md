# code-challenge — Vision

## Purpose
A personal practice bench for [Advent of Code](https://adventofcode.com/) and
[Project Euler](https://projecteuler.net/). It sits beside the editor: every save re-runs the
solution and streams the output, so the loop between writing code and seeing an answer is
seconds long.

## Target user
Joe, solving puzzles for fun and to keep his TypeScript sharp. Single user, localhost only.

## Value proposition
One place for every puzzle solved so far: progress (stars / solved), accepted answers for ✓/✗
checks, test sets, shared helpers in `lib/`, and canvas visualizations — instead of a folder of
loose scripts.

## Business model
None. Personal tool, published publicly on GitHub as a portfolio piece.

## Roadmap
TBD — keep solving; add helpers to `lib/` as patterns repeat.

## Out of scope
- Hosting it anywhere. It has full file-system access and runs solution code; it binds to
  `127.0.0.1` on purpose.
- Scraping completion status from the sites (completion is marked by hand).
