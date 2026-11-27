import Anthropic from "@anthropic-ai/sdk";

// IDs come from `ant apply` (see anthropic/README.md) and are set as Vercel env vars.
export const AGENT_ID = process.env.BULDEE_TAKEOFF_AGENT_ID ?? "";
export const ESTIMATE_AGENT_ID = process.env.BULDEE_ESTIMATE_AGENT_ID ?? "";
export const ENVIRONMENT_ID = process.env.BULDEE_ENVIRONMENT_ID ?? "";

// Hard cap per run, in US cents (list price). Default $25.
export const RUN_BUDGET_CENTS = process.env.BULDEE_RUN_BUDGET_CENTS ?? "2500";

export const client = new Anthropic(); // reads ANTHROPIC_API_KEY

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

// Until real sign-in exists, an access code keeps strangers from starting paid runs.
export function checkAccess(req: Request): Response | null {
  const code = process.env.BULDEE_ACCESS_CODE;
  if (!code) return null;
  if (req.headers.get("x-buldee-code") === code) return null;
  return json({ error: "access_code" }, 401);
}

export function configured(tool: "takeoff" | "estimate" | "any" = "any"): Response | null {
  const agent = tool === "estimate" ? ESTIMATE_AGENT_ID : tool === "takeoff" ? AGENT_ID : AGENT_ID || ESTIMATE_AGENT_ID;
  if (!process.env.ANTHROPIC_API_KEY || !agent || !ENVIRONMENT_ID) {
    return json({ error: "not_configured" }, 503);
  }
  return null;
}

export const MAX_FILES = 4;
export const MAX_BYTES = 30 * 1024 * 1024;
