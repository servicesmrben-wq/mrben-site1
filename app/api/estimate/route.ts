import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ status: "Server is awake and ready." }, { status: 200 });
}

const SYSTEM_PROMPT = `You are an expert estimator. Analyze these photos to count window panes.

CRITICAL VISUAL RULES:

STORY IDENTIFICATION - READ CAREFULLY:
A "2nd story" only exists if you can clearly see two separate living levels stacked vertically with a floor/ceiling between them (like a full two-story house). A tall single-story wall with windows placed at different heights is still 1st floor. A split-level or raised foundation where windows appear at two heights on the same wall does NOT create a 2nd story. When in doubt, classify as 1st floor (pane_1st_base). Only use pane_2nd_story or pane_3rd_story when a full upper floor with its own distinct windows is unambiguously visible.

OBSTRUCTIONS: Actively look behind propane tanks, AC units, plastic winter shelters, and into shadows. Do not miss partially hidden windows.

SYMMETRY INFERENCE:
Residential homes are often architecturally symmetric. Use this to your advantage:
- If you can clearly count panes on one side of a wall but the other side is partially obstructed, infer the hidden side likely mirrors the visible side.
- If you see a window group with 3 panes on the left of a door, assume the right side likely has 3 panes too unless you can clearly see otherwise.
- If a window is partially hidden by a tree, tank, or shelter but a similar window elsewhere on the same wall is fully visible, use that visible window as a reference for the hidden one.
- Only apply symmetry inference when you have a clear reference window to compare against. Do not guess randomly.
- When using symmetry, note it in the analysis field: "Right window partially hidden by tree, inferred 3 panes based on matching left window."

FULL WIDTH SCANNING: Before counting, mentally divide each wall into left, center, and right thirds. Count each third separately, then sum them. Never stop scanning at an obstruction — always continue to the far edge of the wall.

PURE PANE COUNTING: Ignore window styles or opening mechanisms. Count every distinct piece of glass separated by a physical frame divider. A window divided into 2 glass sections = 2 panes. Divided into 3 = 3 panes.

BASEMENT: Look closely at the foundation/concrete line near ground level. Count every distinct piece of glass in the foundation zone.

DOORS: Count each distinct glass panel in entry doors and patio doors as 'patio_door_panel'. A door with 2 glass panels = 2. A door with a small window lite = 1. Do NOT skip door glass.

TRANSOMS: Glass above a door counts as 'patio_door_panel' (map to 1st floor).

SPATIAL MAPPING:
- Windows on an unambiguous upper floor = pane_2nd_story or pane_3rd_story
- All other windows including split-level, raised foundation upper windows, and any ambiguous cases = pane_1st_base
- Door glass panels = patio_door_panel

DOUBLE-CHECK METHODOLOGY:
You MUST perform TWO COMPLETE PASSES through the images before finalizing your answer:

PASS 1 - Initial Count:
- Scan all images systematically
- Count all window panes following the rules above
- Document your initial counts

PASS 2 - Verification:
- Re-examine each image from scratch as if you haven't seen it before
- Recount independently without referencing your first count
- Look specifically for:
  * Windows you might have missed behind obstructions
  * Areas where symmetry inference should apply
  * Basement windows near the foundation
  * Door glass panels
  * Any discrepancies between passes

RECONCILIATION:
- Compare Pass 1 and Pass 2 counts
- If they differ, re-examine those specific areas
- Explain any differences found
- Use the more accurate count (usually the higher one if windows were missed in one pass)

OUTPUT FORMAT:
You MUST return raw JSON only. No markdown. No backticks. No text before or after the JSON.
Your entire response must start with { and end with }.

{
"pass_1_analysis": "First pass findings...",
"pass_1_counts": { "pane_3rd_story": 0, "pane_2nd_story": 0, "pane_1st_base": 0, "patio_door_panel": 0 },
"pass_2_analysis": "Second pass findings...",
"pass_2_counts": { "pane_3rd_story": 0, "pane_2nd_story": 0, "pane_1st_base": 0, "patio_door_panel": 0 },
"reconciliation": "Explanation of any differences and why final counts were chosen...",
"final_counts": { "pane_3rd_story": 0, "pane_2nd_story": 0, "pane_1st_base": 0, "patio_door_panel": 0 },
"stories": 1
}`;

function extractJSON(text: string) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response");
  return JSON.parse(jsonMatch[0].trim());
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
      setTimeout(() => reject(new Error("Request Timeout")), 58000);
    });

    const callConfig = {
      model: "claude-opus-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user" as const,
          content: [
            ...imageParts.flat(),
            { 
              type: "text" as const, 
              text: "Perform TWO complete counting passes on all images, then reconcile any differences and provide your final counts in the JSON format specified." 
            },
          ],
        },
      ],
    };

    // Single API call with self-review
    const result = await Promise.race([
      client.messages.create(callConfig),
      timeoutPromise
    ]) as Anthropic.Message;
    
    const rawText = result.content[0].type === "text" ? result.content[0].text : "";
    const parsedData = extractJSON(rawText);

    return NextResponse.json({
      pass_1_analysis: parsedData.pass_1_analysis,
      pass_1_counts: parsedData.pass_1_counts,
      pass_2_analysis: parsedData.pass_2_analysis,
      pass_2_counts: parsedData.pass_2_counts,
      reconciliation: parsedData.reconciliation,
      window_counts: parsedData.final_counts,
      stories: parsedData.stories || 1,
    });

  } catch (error: any) {
    console.error("Estimation Error:", error);
    const message = error.message || "An unexpected error occurred.";
    const status = message.includes("Timeout") ? 504 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}