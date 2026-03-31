import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!file.type.startsWith("image/")) {
      return new Response(JSON.stringify({ error: "Only images allowed" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Optional: enforce a size limit (e.g., 15 MB)
    const MAX_BYTES = 15 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return new Response(JSON.stringify({ error: "File too large (max 8MB)" }), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      });
    }

    const filename = `contact/${randomUUID()}-${file.name}`;

    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    return new Response(JSON.stringify({ url: blob.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

