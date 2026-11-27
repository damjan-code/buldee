# Buldee

Upload a construction job's files and Buldee runs the right tool on them (Take Off, Estimate, Schedule, Daily Log, Purchase), returning one Excel file built on the Buldee Estimate Template.

## Layout

- `public/index.html` - the site (one HTML page). Take Off runs for real when the API is configured; other tools are still simulated, with sample Excel files built in the browser.
- `api/` - Vercel functions: `upload` (browser uploads to Vercel Blob), `runs` (start a Take Off run), `run-status` (progress), `run-file` (download the Excel file).
- `anthropic/` - the takeoff skill, the Buldee Estimate Template, and the agent and environment definitions. Setup steps are in `anthropic/README.md`.

## How a Take Off run works

1. The browser uploads the job files (up to 4, 30 MB each) to Vercel Blob.
2. `POST /api/runs` copies them into the Anthropic Files API, deletes the blobs, and starts a Managed Agents session with the `buldee-takeoff` skill and a $25 spend cap.
3. The page checks `/api/run-status` every 15 seconds. When the run finishes, the Excel file shows up in My projects and downloads through `/api/run-file`.
