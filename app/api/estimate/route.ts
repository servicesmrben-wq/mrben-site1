import OpenAI from "openai";
import { NextResponse } from "next/server";

export const maxDuration = 58;
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ status: "Server is awake and ready." }, { status: 200 });
}

const SYSTEM_PROMPT = `You are an expert window washing estimator. Analyze these photos to count glass sections for pricing purposes.

CORE DEFINITION — READ FIRST:
A "glass section" is each distinct, separate piece of glass divided by a physical mullion, muntin, or frame divider. This is the unit used for window washing pricing.
- A wide window with 3 vertical sections = 3 glass sections
- A single uninterrupted pane of glass = 1 glass section
- A mulled window bank (multiple units joined in one outer frame) = count each individual section
- A window with a fixed center + two operable side lites = 3 glass sections
- Always count what you can see separated by a physical divider — do not count decorative grille patterns printed on or between glass layers UNLESS they create a true physical divider

GRID WINDOWS — CRITICAL:
Windows can be divided both vertically AND horizontally creating a grid.
- A window with 3 columns and 2 rows = 6 glass sections (3×2)
- A window with 2 columns and 2 rows = 4 glass sections (2×2)
- Always check for horizontal rails dividing a window into upper and lower rows
- Do not stop counting after identifying vertical sections — scan the full height too
- Formula: count columns × count rows = total glass sections for that window

STORY IDENTIFICATION - READ CAREFULLY:
A "2nd story" only exists if you can clearly see two separate living levels stacked vertically with a floor/ceiling between them (like a full two-story house). A tall single-story wall with windows placed at different heights is still 1st floor. A split-level or raised foundation where windows appear at two heights on the same wall does NOT create a 2nd story. When in doubt, classify as 1st floor (sections_1st_base). Only use sections_2nd_story or sections_3rd_story when a full upper floor with its own distinct windows is unambiguously visible.

OBSTRUCTIONS: Actively look behind propane tanks, AC units, plastic winter shelters, and into shadows. Do not miss partially hidden windows.

SYMMETRY INFERENCE:
Residential homes are often architecturally symmetric. Use this to your advantage:
- If you can clearly count sections on one side of a wall but the other side is partially obstructed, infer the hidden side likely mirrors the visible side.
- If you see a window with 3 sections on the left of a door, assume the right side likely has 3 sections too unless you can clearly see otherwise.
- Only apply symmetry inference when you have a clear reference window to compare against. Do not guess randomly.
- When using symmetry, note it in the analysis field: "Right window partially hidden by tree, inferred 3 sections based on matching left window."

FULL WIDTH SCANNING: Before counting, mentally divide each wall into left, center, and right thirds. Count each third separately, then sum them. Never stop scanning at an obstruction — always continue to the far edge of the wall.

BASEMENT: Look closely at the foundation/concrete line near ground level. Count every distinct glass section in the foundation zone. Basement windows are often smaller hopper-style units — count each glass section carefully.

DOORS: Count each distinct glass panel in entry doors and patio doors as 'door_glass_section'. A door with 2 glass panels = 2. A door with a small window lite = 1. A full-length patio door = count each sliding/fixed panel. Do NOT skip door glass. Glass above a door (transoms) and narrow sidelights beside a door also count as 'door_glass_section'.

CONSISTENCY CHECK:
- Windows on the same wall typically have similar section configurations
- If one window has 3 sections, adjacent similar-sized windows likely have 3 sections too
- Exception: bathroom windows are often different (smaller, fewer sections)
- Use this pattern recognition to verify your counts and catch errors

ZOOM IN MENTALLY:
- When counting, mentally zoom into each window
- Look for vertical and horizontal frame dividers (mullions/muntins) between sections
- A thin metal or vinyl bar separating two pieces of glass = a divider = separate sections
- Decorative grids sandwiched between two layers of glass with no true physical separation = do NOT count as separate sections
- A single large uninterrupted pane = 1 section

SPATIAL MAPPING:
- Windows on an unambiguous upper floor = sections_2nd_story or sections_3rd_story
- All other windows including split-level, raised foundation upper windows, and any ambiguous cases = sections_1st_base
- Door glass panels = door_glass_section

COUNTING METHODOLOGY:
- First pass: scan left-to-right across each image, count every glass section per window
- Second pass: verify basement, doors, sidelights, transoms, garage windows, obstructions
Your entire response must be raw JSON only. No scratchpad, no markdown, no backticks, no text before or after the JSON. Start with { and end with }.

{
"analysis": "Brief summary of counting process and key findings, noting any mulled windows, obstructions, or symmetry inferences...",
"confidence": "high/medium/low",
"final_counts": { "sections_3rd_story": 0, "sections_2nd_story": 0, "sections_1st_base": 0, "door_glass_section": 0 },
"stories": 1
}

Begin your analysis now.`;

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
      max_tokens: 1024,
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

