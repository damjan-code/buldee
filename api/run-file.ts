// GET /api/run-file?id=sesn_...&file=file_... - download a run's Excel file.
import { checkAccess, client, configured, json } from "../lib/anthropic.js";

export async function GET(req: Request): Promise<Response> {
  const denied = checkAccess(req) ?? configured();
  if (denied) return denied;
  const q = new URL(req.url).searchParams;
  const id = q.get("id") ?? "", fileId = q.get("file") ?? "";
  if (!/^sesn_[A-Za-z0-9]+$/.test(id) || !/^file_[A-Za-z0-9]+$/.test(fileId)) return json({ error: "bad_id" }, 400);

  // Only serve files that this run wrote.
  let name = "";
  for await (const f of client.beta.files.list({ scope_id: id, betas: ["managed-agents-2026-04-01"] })) {
    if (f.id === fileId) { name = f.filename; break; }
  }
  if (!name) return json({ error: "not_found" }, 404);

  const resp = await client.files.download(fileId);
  return new Response(resp.body, {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
      "cache-control": "no-store",
    },
  });
}
