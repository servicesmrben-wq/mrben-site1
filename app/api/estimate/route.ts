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

OUTPUT FORMAT:
You MUST return raw JSON only. No markdown. No backticks. No text before or after the JSON.
Your entire response must start with { and end with }.
Use the 'analysis' field for brief step-by-step reasoning per image before finalizing counts.
{
"analysis": "Img 1: ...",
"window_counts": { "pane_3rd_story": 0, "pane_2nd_story": 0, "pane_1st_base": 0, "patio_door_panel": 0 },
"stories": 1
}`;

const REVIEW_PROMPT = `You previously counted window panes in these images and got this result:
{PREVIOUS_RESULT}

Review the images one more time focusing specifically on:
- Basement windows near the foundation line that may have been missed
- Windows on the far left and right edges of walls
- Any windows partially hidden by objects like tanks, AC units, or shelters
- Door glass panels that may have been skipped
- Large windows that may have been undercounted (e.g. counted as 1 pane when they are 2 or 3)

Studies show AI vision models typically undercount — bias your review toward finding more panes if you are unsure.

If you believe the count is too low, return adjusted numbers. If you think the count is correct, return the same numbers.

You MUST return raw JSON only. No markdown. No backticks. No text before or after the JSON.
Your entire response must start with { and end with }.
{
"analysis": "Review notes...",
"window_counts": { "pane_3rd_story": 0, "pane_2nd_story": 0, "pane_1st_base": 0, "patio_door_panel": 0 },
"stories": 1
}`;

function averageCounts(first: any, second: any) {
  const keys = ["pane_3rd_story", "pane_2nd_story", "pane_1st_base", "patio_door_panel"];
  const averaged: any = {};
  for (const key of keys) {
    averaged[key] = Math.round(((first[key] || 0) + (second[key] || 0)) / 2);
  }
  return averaged;
}

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

    // Convert files to Anthropic image format
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

    // --- PASS 1: Initial count ---
    const pass1Promise = client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            ...imageParts.flat(),
            { type: "text", text: "Analyze all images and return the JSON result." },
          ],
        },
      ],
    });

    const pass1Result = await Promise.race([pass1Promise, timeoutPromise]) as Anthropic.Message;
    const pass1Text = pass1Result.content[0].type === "text" ? pass1Result.content[0].text : "";
    const pass1Data = extractJSON(pass1Text);

    // --- PASS 2: Self-critique review ---
    const reviewPrompt = REVIEW_PROMPT.replace(
      "{PREVIOUS_RESULT}",
      JSON.stringify(pass1Data.window_counts)
    );

    const pass2Promise = client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      system: reviewPrompt,
      messages: [
        {
          role: "user",
          content: [
            ...imageParts.flat(),
            { type: "text", text: "Review your previous count and return the JSON result." },
          ],
        },
      ],
    });

    const pass2Result = await Promise.race([pass2Promise, timeoutPromise]) as Anthropic.Message;
    const pass2Text = pass2Result.content[0].type === "text" ? pass2Result.content[0].text : "";
    const pass2Data = extractJSON(pass2Text);

    // --- Average the two passes ---
    const averagedCounts = averageCounts(pass1Data.window_counts, pass2Data.window_counts);

    return NextResponse.json({
      analysis: `Pass 1: ${pass1Data.analysis}\n\nPass 2 (review): ${pass2Data.analysis}`,
      window_counts: averagedCounts,
      stories: pass1Data.stories,
      pass1_counts: pass1Data.window_counts,
      pass2_counts: pass2Data.window_counts,
    });

  } catch (error: any) {
    console.error("Estimation Error:", error);
    const message = error.message || "An unexpected error occurred.";
    const status = message.includes("Timeout") ? 504 : 500;
    return NextResponse.json({ error: message }, { status: status });
  }
}