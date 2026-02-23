import { NextRequest, NextResponse } from "next/server";
// Estimator Route - OpenAI
import OpenAI from "openai";

/**
 * API route for counting window panes and stories from uploaded photos.
 *
 * This route expects a multipart/form-data POST with one or more files under
 * the key `files`. Each file should be an image (JPEG/PNG/etc.). The route
 * runs two passes of a vision‑capable LLM: a fast global pass and a slower
 * “miss detector” pass focused on common failure modes (basement windows,
 * deep shadows, obstructions). The two results are merged conservatively
 * (taking the maximum count for each category). Regardless of success or
 * failure, the route always returns a schema‑valid JSON object with
 * integers ≥ 0 and at least one story.
 */

export const runtime = "nodejs";
// Hard timeout for the route; keep this ≤ 60s to satisfy Vercel constraints.
export const maxDuration = 60;

// WARM-UP HANDLER (page-load prefetch / keepalive)
export async function GET() {
  return NextResponse.json(
    {
      analysis: "warmup",
      window_counts: {
        pane_3rd_story: 0,
        pane_2nd_story: 0,
        pane_1st_base: 0,
        patio_door_panel: 0,
      },
      stories: 1,
    },
    { status: 200 }
  );
}

export async function OPTIONS() {
  return NextResponse.json(
    {
      analysis: "warmup",
      window_counts: {
        pane_3rd_story: 0,
        pane_2nd_story: 0,
        pane_1st_base: 0,
        patio_door_panel: 0,
      },
      stories: 1,
    },
    { status: 200 }
  );
}

// Type definitions for the returned schema
interface PaneCounts {
  pane_3rd_story: number;
  pane_2nd_story: number;
  pane_1st_base: number;
  patio_door_panel: number;
}

interface Estimate {
  analysis: string;
  window_counts: PaneCounts;
  stories: number;
}

/**
 * Create an empty estimate object with a specified analysis message. All counts
 * are zero and stories is set to 1 to avoid a zero‑story building.
 */
function emptyEstimate(analysis: string): Estimate {
  return {
    analysis,
    window_counts: {
      pane_3rd_story: 0,
      pane_2nd_story: 0,
      pane_1st_base: 0,
      patio_door_panel: 0,
    },
    // Default to 1 story (a building must have at least one level)
    stories: 1,
  };
}

/**
 * Normalise and validate a raw object parsed from the model. Ensures all
 * expected keys exist, rounds floats, clamps negatives to zero, and
 * enforces at least 1 story. If the object is missing fields, defaults to
 * zero or one appropriately.
 */
function normalizeEstimate(raw: any): Estimate {
  const counts: any = (raw && raw.window_counts) || {};
  const normalized: Estimate = {
    analysis: typeof raw?.analysis === "string" ? raw.analysis : "",
    window_counts: {
      pane_3rd_story: Math.max(0, Math.round(Number(counts.pane_3rd_story) || 0)),
      pane_2nd_story: Math.max(0, Math.round(Number(counts.pane_2nd_story) || 0)),
      pane_1st_base: Math.max(0, Math.round(Number(counts.pane_1st_base) || 0)),
      patio_door_panel: Math.max(0, Math.round(Number(counts.patio_door_panel) || 0)),
    },
    stories: Math.max(1, Math.round(Number(raw?.stories) || 1)),
  };
  return normalized;
}

// Instantiate the OpenAI client. The API key must be provided in the
// environment; if it is missing, the POST handler will return an error.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Make a single LLM call using a vision‑capable model. The prompt instructs
 * the model to count window panes and stories according to specific rules.
 *
 * @param modelName Name of the OpenAI model to use (e.g. "gpt-5.2" or "gpt-4.1-mini").
 * @param instructions The system/user instructions that define how the model should perform the count.
 * @param dataUrls Array of base64 data URLs for the uploaded images.
 * @param timeoutMs Milliseconds to wait before aborting this request.
 */
async function runVisionModel(
  modelName: string,
  instructions: string,
  dataUrls: string[],
  timeoutMs: number,
): Promise<Estimate> {
  // Set up an abort controller for the per‑call timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Build the message content combining instructions and images. Each
    // component must specify its type. We use detail:"high" on images
    // to maximise fidelity for small basement windows.
    const content: any[] = [
      { type: "text", text: instructions },
      ...dataUrls.map((url) => ({ type: "image_url", image_url: { url, detail: "high" } })),
    ];

    // Call chat completions with JSON mode. We deliberately set
    // temperature to zero for deterministic output and specify the
    // response_format as a JSON object. The model will return a single
    // string representing the JSON result.
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "user",
          content,
        },
      ],
      temperature: 0,
      // Limit token budget to keep latency low. We don't specify max_tokens
      // because the models used should produce concise JSON output.
      response_format: { type: "json_object" },
      // Attach abort signal for per‑call timeout
      signal: controller.signal,
    } as any);

    // Extract the content from the response; depending on the SDK it
    // may be at response.choices[0].message.content or response.choices[0].message
    const text = (response as any)?.choices?.[0]?.message?.content ?? "";

    // Some models wrap JSON in code fences. Strip any surrounding backticks
    // or markdown fences. Then parse and normalise.
    const cleaned = String(text)
      .replace(/^\s*```\s*json\s*/i, "")
      .replace(/^\s*```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // If parsing fails, return an empty estimate with the raw text in analysis
      return emptyEstimate(`Failed to parse JSON: ${cleaned}`);
    }
    return normalizeEstimate(parsed);
  } catch (err: any) {
    // If the call errors or times out, include the error message in analysis.
    const message = err?.name === "AbortError" ? `timeout after ${timeoutMs}ms` : String(err?.message || err);
    return emptyEstimate(message);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The main POST handler. Reads uploaded image files, runs two passes of the
 * model, merges the results, and returns a schema‑valid JSON response.
 */
export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  // Validate API key early
  if (!process.env.OPENAI_API_KEY) {
    const msg = "Missing OPENAI_API_KEY environment variable";
    return NextResponse.json(emptyEstimate(msg), { status: 500 });
  }

  // Parse the incoming form data
  let form: FormData;
  try {
    form = await request.formData();
  } catch (e: any) {
    return NextResponse.json(emptyEstimate(`Invalid form data: ${String(e?.message || e)}`), { status: 400 });
  }

  // Gather image files. `form.getAll('files')` returns File objects if present.
  const uploads = form.getAll("files");
  const dataUrls: string[] = [];
  for (const item of uploads) {
    // Only handle objects that resemble File with an arrayBuffer method
    if (item && typeof (item as any).arrayBuffer === "function" && typeof (item as any).type === "string") {
      const file = item as unknown as { arrayBuffer: () => Promise<ArrayBuffer>; type: string };
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = buffer.toString("base64");
        dataUrls.push(`data:${file.type};base64,${base64}`);
      } catch {
        // Skip files that cannot be processed
      }
    }
  }

  if (dataUrls.length === 0) {
    return NextResponse.json(emptyEstimate("No valid image files provided"), { status: 400 });
  }

  // Define the instruction strings for the two passes. These should be
  // concise but cover all counting rules. The first pass performs a
  // comprehensive scan of the entire facade, while the second pass focuses
  // on missed areas such as basements, dark corners and obstructions.
  const pass1Instructions = [
    "You are a careful assistant counting window panes and stories from photographs of buildings.",
    "Each distinct framed glass section separated by mullions counts as one pane.",
    "Standard single‑hung, double‑hung and sliding windows have two panes.",
    "Basement slider windows count as two panes.",
    "Count partially visible windows when the framing is identifiable.",
    "Count sliding/patio door panels as patio_door_panel, not as window panes.",
    "Classify panes by floor level: pane_3rd_story (third floor), pane_2nd_story (second floor), pane_1st_base (first floor and basement).",
    "Also return stories equal to the greatest floor with any windows detected (minimum 1).",
    "Scan each image systematically from left to right and top to bottom. When unsure whether something is a pane, include it; do not miss panes.",
    "Respond with a JSON object only, matching exactly: { \"analysis\": string, \"window_counts\": { \"pane_3rd_story\": number, \"pane_2nd_story\": number, \"pane_1st_base\": number, \"patio_door_panel\": number }, \"stories\": number }.",
  ].join(" \n");

  const pass2Instructions = [
    "Re‑examine the same images focusing on areas commonly missed.",
    "Look carefully near the foundation line for basement windows, within deep shadows, and behind winter plastic shelters, bushes, railings and other obstructions.",
    "Add any panes or patio door panels you find to the counts, but do not double‑count anything already counted.",
    "Use the same counting rules as before. When in doubt about a pane, include it.",
    "Return your result as JSON ONLY in the same format as before: { \"analysis\": string, \"window_counts\": { \"pane_3rd_story\": number, \"pane_2nd_story\": number, \"pane_1st_base\": number, \"patio_door_panel\": number }, \"stories\": number }.",
  ].join(" \n");

  // Choose models for each pass. Pass 1 uses a fast, high‑throughput model;
  // Pass 2 uses a more meticulous model to catch missed details. Adjust
  // model names as newer models become available.
  const pass1Model = "gpt-5.2";
  const pass2Model = "gpt-4.1-mini";

  // Define per‑pass timeouts (in milliseconds). Keeping each pass below
  // ~26 seconds leaves headroom for processing and response sending.
  const timeoutPerPass = 26_000;

  // Run both passes sequentially. If the first pass times out or fails,
  // continue with whatever result is returned; the second pass will still run.
  const result1 = await runVisionModel(pass1Model, pass1Instructions, dataUrls, timeoutPerPass);
  const result2 = await runVisionModel(pass2Model, pass2Instructions, dataUrls, timeoutPerPass);

  // Merge results conservatively: take the maximum count for each category and
  // for the number of stories. Concatenate analyses to preserve any notes.
  const merged: Estimate = {
    analysis: `ok pass1=${result1.window_counts.pane_3rd_story + result1.window_counts.pane_2nd_story + result1.window_counts.pane_1st_base + result1.window_counts.patio_door_panel} pass2=${result2.window_counts.pane_3rd_story + result2.window_counts.pane_2nd_story + result2.window_counts.pane_1st_base + result2.window_counts.patio_door_panel} merged=${Math.max(result1.window_counts.pane_3rd_story, result2.window_counts.pane_3rd_story) + Math.max(result1.window_counts.pane_2nd_story, result2.window_counts.pane_2nd_story) + Math.max(result1.window_counts.pane_1st_base, result2.window_counts.pane_1st_base) + Math.max(result1.window_counts.patio_door_panel, result2.window_counts.patio_door_panel)} ms=${Date.now() - startedAt}`,
    window_counts: {
      pane_3rd_story: Math.max(result1.window_counts.pane_3rd_story, result2.window_counts.pane_3rd_story),
      pane_2nd_story: Math.max(result1.window_counts.pane_2nd_story, result2.window_counts.pane_2nd_story),
      pane_1st_base: Math.max(result1.window_counts.pane_1st_base, result2.window_counts.pane_1st_base),
      patio_door_panel: Math.max(result1.window_counts.patio_door_panel, result2.window_counts.patio_door_panel),
    },
    stories: Math.max(result1.stories, result2.stories),
  };

  return NextResponse.json(merged);
}

function methodNotAllowed() {
  return NextResponse.json(emptyEstimate("method_not_allowed"), { status: 405 });
}

export async function PUT() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function HEAD() {
  return methodNotAllowed();
}
