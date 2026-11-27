# Anthropic setup for Buldee

The Take Off button runs the `daskal-takeoff` skill on Anthropic Managed Agents.

- `skills/daskal-takeoff/` - Damjan's daskal-takeoff skill, word for word, with a "Running on Buldee" section 0 in place of the Dropbox download steps and `assets/Buldee Estimate Template.xlsx`.
- `agents/buldee-takeoff.md` - the agent (Claude Opus 5.5, the skill, the xlsx skill, web tools off).
- `environments/buldee.yaml` - the cloud sandbox (limited network, package installs allowed).

## One-time setup

Needs the `ant` CLI and an API key in `ANTHROPIC_API_KEY`. From the repo root:

```sh
ant apply --dry-run -v anthropic/agents/buldee-takeoff.md anthropic/environments/buldee.yaml
ant apply --yes anthropic/agents/buldee-takeoff.md anthropic/environments/buldee.yaml
```

Commit the `claude-lock.json` it writes. Then copy the agent and environment IDs from it into Vercel:

| Vercel env var | Value |
| --- | --- |
| `ANTHROPIC_API_KEY` | your API key |
| `BULDEE_TAKEOFF_AGENT_ID` | `agent_...` from `claude-lock.json` |
| `BULDEE_ENVIRONMENT_ID` | `env_...` from `claude-lock.json` |
| `BULDEE_ACCESS_CODE` | any code; the page asks for it before a paid run (until real sign-in exists) |
| `BULDEE_RUN_BUDGET_CENTS` | optional, per-run spend cap in cents, default `2500` ($25) |
| `BLOB_READ_WRITE_TOKEN` | added automatically when you connect a Vercel Blob store |

To change the skill or the agent, edit the files and run `ant apply` again.
