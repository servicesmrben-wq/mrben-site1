import OpenAI from "openai";
import { NextResponse } from "next/server";

export const maxDuration = 58;
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ status: "Server is awake and ready." }, { status: 200 });
}

const SYSTEM_PROMPT = `You are an expert window-washing estimator. You will be given MULTIPLE photos of the SAME property. Your job is to count distinct glass sections (pricing units) accurately and conservatively, without double counting across photos.

NON-NEGOTIABLE OUTPUT:
- Output MUST be raw JSON only (no markdown, no backticks, no extra text).
- Start with { and end with }.
- Must include exactly these keys: analysis, confidence, final_counts, stories.
- final_counts values MUST be integers >= 0.

PRIMARY COUNTING UNIT — READ FIRST:
A "glass section" is one physically separate piece of glass bounded by real frame/mullion/muntin dividers (a true physical separation).
- If a window is split by a real vertical divider into 3 parts => 3 sections.
- If it is a grid: sections = columns × rows (e.g., 3×2=6).
- Mulled banks: count each unit/section within the larger outer frame.
- DO NOT count decorative grids BETWEEN glass layers unless you have clear evidence they are true physical dividers.

CRITICAL: MULTI-PHOTO ANTI-DUPLICATE RULE (MOST IMPORTANT):
These photos can overlap. You must produce ONE set of counts for the house WITHOUT double counting the same windows seen in multiple images.
Method:
1) Build a mental "master map" of UNIQUE windows/doors for the property.
2) For each unique window/door, pick the clearest view among photos to count sections.
3) If the same window appears in two photos, count it ONCE (use the best/closest/least-glare view).
4) If unsure whether two windows are the same, use landmarks (door, garage, corners, roofline, deck, chimney) to decide. If still unsure, assume overlap (avoid double counting) and note it in analysis.

ANTI-REFLECTION / ANTI-ILLUSION RULES:
Reflections and shadows can look like dividers. Only count a divider when at least ONE of these is true:
- The divider clearly connects to the window frame on both ends (touches frame).
- The divider has consistent thickness and alignment across the entire pane.
- The divider is visible across multiple photos/angles OR has a visible physical edge/casting.
Do NOT count:
- Lines that appear only in glare/reflection.
- Interior blinds, curtains, or reflected siding lines.
- Water streaks, dirt, tape, or screen patterns.
If a "grid" is ambiguous, prefer fewer sections and mark confidence lower.

GRID WINDOWS — DO NOT MISS ROWS:
Many windows have both vertical AND horizontal splits.
Always confirm ROWS:
- Identify columns first, then verify horizontal rails (upper/lower).
- Compute columns × rows.
- If the top sash is divided but bottom is not (or vice versa), count sections accordingly.

STORY IDENTIFICATION (STRICT):
A "2nd story" exists ONLY when a full separate living level is clearly visible (distinct floor/ceiling line, true upper facade windows).
Split-levels, raised foundations, and staggered window heights on one tall wall are still sections_1st_base unless an unmistakable full upper floor is visible.
When in doubt: classify as sections_1st_base.
stories = 1, 2, or 3 (integer).

BASEMENT (EASY TO MISS):
Actively scan the foundation line / concrete band near ground level. Basement windows are often small. Count their sections carefully (usually 1, sometimes 2+ if divided).

DOORS / GLASS PANELS (COUNT SEPARATELY):
Count all distinct glass panels associated with doors as door_glass_section:
- Entry door lites (small or full)
- Sidelights (narrow vertical glass beside door)
- Transoms (glass above door)
- Patio doors: count each sliding/fixed glass panel as separate if physically divided.

OBSTRUCTIONS & FULL-WIDTH SCANNING:
Do not stop at trees, propane tanks, AC units, winter shelters, shadows.
Scan each facade left-to-right and top-to-bottom (including garage windows).

SYMMETRY INFERENCE (CONTROLLED):
Use symmetry ONLY when:
- One side is clearly visible and the other side is partially blocked, AND
- The architecture strongly suggests mirroring.
If you apply symmetry, say so in analysis ("inferred right window matches left: 3 sections").

COUNTING PROTOCOL (DO THIS ORDER):
PASS A — MASTER MAP (NO NUMBERS YET):
Identify unique facades/areas (front/back/left/right) and list unique window/door groups mentally so you don't double count across photos.

PASS B — PER-OPENING COUNT:
For each unique opening, count glass sections using the clearest photo. Apply grid math (columns × rows). Assign it to:
- sections_1st_base / sections_2nd_story / sections_3rd_story OR door_glass_section.

PASS C — AUDIT / SANITY CHECK:
- Verify you counted: basement, doors, sidelights, transoms, garage windows.
- Check for "too perfect" totals caused by double counting across photos.
- If multiple photos show the same facade, ensure windows were only counted once.

RETURN JSON ONLY IN THIS SHAPE:
{
  "analysis": "Short: what facades/photos were used as primary, any overlap avoided, any symmetry inference, any glare/reflection uncertainty.",
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
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: Missing OpenAI API Key" },
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
        const base64 = buffer.toString("base64");
        return [
          { type: "text" as const, text: `Image ${index + 1}:` },
          {
            type: "image_url" as const,
            image_url: {
              url: `data:${file.type};base64,${base64}`,
              detail: "high" as const,
            },
          },
        ];
      })
    );

    const client = new OpenAI({ apiKey });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request Timeout")), 55000);
    });

    const callConfig = {
      model: "gpt-5.2",
      max_completion_tokens: 1024,
      messages: [
        {
          role: "system" as const,
          content: SYSTEM_PROMPT,
        },
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

    // Single API call
    const result = await Promise.race([
      client.chat.completions.create(callConfig),
      timeoutPromise,
    ]) as OpenAI.Chat.ChatCompletion;

    const rawText = result.choices[0]?.message?.content ?? "";
    console.log("RAW CLAUDE RESPONSE:", rawText.substring(0, 500));
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