# code-challenge

Read `~/.claude/STANDARDS.md`, then `PROJECT.md` (technical reference and deviations),
`VISION.md`, and `SPEC.md` (the full app design). Specs live in `.specs/`.

Key conventions:
- Localhost only, single branch `main`, nothing deploys. Push to GitHub; there is no CI.
- `.local/config.json` holds the AoC/Euler session cookies. Never commit it or echo its values.
- All state is the committed `progress.json`; keep its shape in sync with SPEC.md.

Quickstart: `nvm use && npm install && npm start` → http://localhost:5180
