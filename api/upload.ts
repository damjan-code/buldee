// Issues short-lived tokens so the browser uploads job files (up to 30 MB each)
// straight to Vercel Blob; function request bodies are capped at 4.5 MB.
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { MAX_BYTES, checkAccess, json } from "../lib/anthropic.js";

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json()) as HandleUploadBody;
  if (body.type === "blob.generate-client-token") {
    const denied = checkAccess(req);
    if (denied) return denied;
  }
  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        maximumSizeInBytes: MAX_BYTES,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    });
    return json(result);
  } catch (e) {
    return json({ error: (e as Error).message }, 400);
  }
}
