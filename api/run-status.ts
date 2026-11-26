// GET /api/run-status?id=sesn_... - where a run is, and its Excel file once done.
import { checkAccess, client, configured, json } from "../lib/anthropic.js";

export async function GET(req: Request): Promise<Response> {
  const denied = checkAccess(req) ?? configured();
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^sesn_[A-Za-z0-9]+$/.test(id)) return json({ error: "bad_id" }, 400);

  const session = await client.beta.sessions.retrieve(id);
  if (session.status === "terminated") return json({ status: "failed", reason: "terminated" });
  if (session.status !== "idle") return json({ status: "running" });

  // Idle: find out why from the latest idle event.
  const page = await client.beta.sessions.events.list(id, { order: "desc", limit: 50 });
  const idle = page.data.find((e) => e.type === "session.status_idle");
  const stop = idle && "stop_reason" in idle ? idle.stop_reason : undefined;

  if (stop?.type === "requires_action") {
    // Nobody watches these runs, so a call the server could not decide on is declined.
    await client.beta.sessions.events.send(id, {
      events: stop.event_ids.map((eid) => ({
        type: "user.tool_confirmation" as const,
        tool_use_id: eid,
        result: "deny" as const,
        deny_message: "Unattended run: skip this step and note it under Key Assumptions.",
      })),
    });
    return json({ status: "running" });
  }
  if (stop?.type === "budget_reached") return json({ status: "failed", reason: "budget_reached" });
  if (stop && stop.type !== "end_turn") return json({ status: "failed", reason: stop.type });

  const files = [];
  for await (const f of client.beta.files.list({ scope_id: id, betas: ["managed-agents-2026-04-01"] })) {
    if (f.filename.toLowerCase().endsWith(".xlsx")) files.push({ id: f.id, name: f.filename, size: f.size_bytes });
  }
  // Outputs can take a few seconds to show up after the run goes idle.
  if (!files.length) return json({ status: "finishing" });
  return json({ status: "done", files });
}
