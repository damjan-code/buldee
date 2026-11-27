// POST /api/runs - start a Take Off run.
// Body: { job, files: [{url, name}], company?: {name, slogan, addr, tel, email, web, logo?} }
// The files were uploaded to Vercel Blob by the browser (see api/upload.ts).
import { toFile } from "@anthropic-ai/sdk";
import { del } from "@vercel/blob";
import {
  AGENT_ID, ENVIRONMENT_ID, MAX_FILES, RUN_BUDGET_CENTS,
  checkAccess, client, configured, json,
} from "../lib/anthropic.js";

type Company = { name?: string; slogan?: string; addr?: string; tel?: string; fax?: string; email?: string; web?: string; logo?: string | null };
type Body = { job?: string; files?: { url: string; name: string }[]; company?: Company | null };

const safeName = (s: string) => s.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "_").slice(0, 120) || "file";

export async function POST(req: Request): Promise<Response> {
  const denied = checkAccess(req) ?? configured();
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as Body;
  const job = safeName((body.job ?? "").trim() || "Job");
  const files = (body.files ?? []).slice(0, MAX_FILES);
  if (!files.length) return json({ error: "no_files" }, 400);
  const blobHost = /\.public\.blob\.vercel-storage\.com$/;
  if (files.some((f) => !blobHost.test(new URL(f.url).hostname))) return json({ error: "bad_file_url" }, 400);

  const resources: { type: "file"; file_id: string; mount_path: string }[] = [];
  try {
    for (const f of files) {
      const r = await fetch(f.url);
      if (!r.ok) throw new Error(`could not read ${f.name}`);
      const up = await client.files.upload({ file: await toFile(r, safeName(f.name)) });
      resources.push({ type: "file", file_id: up.id, mount_path: `/job/${safeName(f.name)}` });
    }
    const c = body.company;
    if (c && (c.name || c.slogan || c.logo)) {
      const { logo, ...info } = c;
      const meta = await client.files.upload({
        file: await toFile(Buffer.from(JSON.stringify(info, null, 2)), "company.json", { type: "application/json" }),
      });
      resources.push({ type: "file", file_id: meta.id, mount_path: "/company/company.json" });
      const m = typeof logo === "string" ? /^data:image\/png;base64,(.+)$/.exec(logo) : null;
      if (m) {
        const img = await client.files.upload({ file: await toFile(Buffer.from(m[1], "base64"), "logo.png", { type: "image/png" }) });
        resources.push({ type: "file", file_id: img.id, mount_path: "/company/logo.png" });
      }
    }
  } finally {
    // The job files now live in the Anthropic Files API; drop the temporary blobs.
    await del(files.map((f) => f.url)).catch(() => {});
  }

  const session = await client.beta.sessions.create({
    agent: AGENT_ID,
    environment_id: ENVIRONMENT_ID,
    title: `Take Off - ${job}`,
    resources,
    budget: { type: "limit", max_list_cost: { amount: RUN_BUDGET_CENTS, currency: "USD" } },
    initial_events: [
      {
        type: "user.message",
        content: [{
          type: "text",
          text: `Run the daskal-takeoff skill for the job "${job}". The job files are in /mnt/session/uploads/job/. ` +
            `Save the result as /mnt/session/outputs/${job} - Buldee Estimate Template.xlsx.`,
        }],
      },
    ],
  });

  return json({ runId: session.id, status: session.status });
}

// GET /api/runs - lets the page know whether live runs are switched on.
export async function GET(): Promise<Response> {
  return json({ ready: configured() === null });
}
