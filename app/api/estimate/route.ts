import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const maxDuration = 58;
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ status: "Server is awake and ready." }, { status: 200 });
}

const SYSTEM_PROMPT = `You are an expert window washing estimator. Analyze MULTIPLE photos of the SAME property and return a single unified count — no double counting across photos.

GLASS SECTION (the unit):
Each physically separate piece of glass bounded by a real frame, mullion, or muntin.
- Grid windows: columns × rows (3×2 = 6)
- Mulled banks: count each pane inside the outer frame
- Single uninterrupted pane = 1
- Decorative grids between glass layers = do NOT count unless bars connect to the frame on both ends

ANTI-DUPLICATE (critical for multi-photo):
Build one master map of unique windows. Use landmarks (garage, door, corners, roofline) to identify the same window across photos. Count each window ONCE using the clearest photo. If unsure whether two windows are the same, assume they are.

ROW CHECK (most common undercount):
After counting columns, always scan top-to-bottom for a horizontal rail. Many windows have 2 rows. Total = columns × rows.

CATEGORIES:
- sections_1st_base: all ground floor + basement + anything ambiguous
- sections_2nd_story: only if a full second living floor is clearly visible
- sections_3rd_story: only if a full third floor is clearly visible
- door_glass_section: entry door lites, sidelights, transoms, patio door panels

DO NOT MISS:
Basement windows (near foundation), garage windows, sidelights, transoms, windows behind AC units / propane tanks / shelters.

SYMMETRY: Only infer hidden windows when one side is clearly blocked AND architecture strongly mirrors the visible side. Note it in analysis.

UNDERCOUNTING vs OVERCOUNTING: When genuinely ambiguous, lean toward the higher plausible count and note it.

Return raw JSON only. No markdown, no backticks, nothing before { or after }.

{
  "analysis": "Which photos used as primary, overlaps avoided, symmetry/inference used, any uncertainty.",
  "confidence": "high/medium/low",
  "final_counts": { "sections_3rd_story": 0, "sections_2nd_story": 0, "sections_1st_base": 0, "door_glass_section": 0 },
  "stories": 1
}`;

function extractJSON(text: string) {
  // Find the JSON block that contains "final_counts" — reliable even with scratchpad text before it
  const marker = text.indexOf('"final_counts"');
  if (marker === -1) throw new Error("No JSON found in response");

  // Walk left from marker to find the opening brace of this object
  let openBrace = -1;
  for (let i = marker; i >= 0; i--) {
    if (text[i] === "{") { openBrace = i; break; }
  }
  if (openBrace === -1) throw new Error("No JSON found in response");

  // Walk right from opening brace, tracking depth to find matching closing brace
  let depth = 0;
  let closeBrace = -1;
  for (let i = openBrace; i < text.length; i++) {
    if (text[i] === "{") depth++;
    if (text[i] === "}") depth--;
    if (depth === 0) { closeBrace = i; break; }
  }
  if (closeBrace === -1) throw new Error("No JSON found in response");

  return JSON.parse(text.slice(openBrace, closeBrace + 1).trim());
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: Missing AI API Key" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Validate file types before processing
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.type}. Please upload JPEG, PNG, GIF, or WebP images.` },
          { status: 400 }
        );
      }
    }

    const imageParts = await Promise.all(
      files.map(async (file, index) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return [
          { type: "text" as const, text: `Image ${index + 1}:` },
          {
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: buffer.toString("base64"),
            },
          },
        ];
      })
    );

    const client = new Anthropic({ apiKey });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request Timeout")), 55000);
    });

    const callConfig = {
      model: "claude-sonnet-4-6",
      max_tokens: 1024, // JSON-only output is small
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user" as const,
          content: [
            ...imageParts.flat(),
            {
              type: "text" as const,
              text: "Count all glass sections across all images. Two passes: first scan left-to-right per image, then verify basement, doors, transoms, sidelights, garage windows. Return raw JSON only.",
            },
          ],
        },
      ],
    };

    // Single API call with self-review
    const result = await Promise.race([
      client.messages.create(callConfig),
      timeoutPromise,
    ]) as Anthropic.Message;

    const rawText = result.content[0].type === "text" ? result.content[0].text : "";
    const parsedData = extractJSON(rawText);

    // Remap new "sections_*" keys back to "pane_*" keys for frontend compatibility
    const counts = parsedData.final_counts;
    const mappedCounts = {
      pane_3rd_story: counts.sections_3rd_story ?? 0,
      pane_2nd_story: counts.sections_2nd_story ?? 0,
      pane_1st_base: counts.sections_1st_base ?? 0,
      patio_door_panel: counts.door_glass_section ?? 0,
    };

    return NextResponse.json({
      analysis: parsedData.analysis,
      confidence: parsedData.confidence,
      window_counts: mappedCounts,
      stories: parsedData.stories || 1,
    });

  } catch (error: any) {
    console.error("Estimation Error:", error);
    const message = error.message || "An unexpected error occurred.";
    const status = message.includes("Timeout") ? 504 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
