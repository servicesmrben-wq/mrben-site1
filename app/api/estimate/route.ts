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
"analysis": "Img 1: Upper wall has 2 windows at main floor height (single story wall, not 2nd story)...",
"window_counts": { "pane_3rd_story": 0, "pane_2nd_story": 0, "pane_1st_base": 0, "patio_door_panel": 0 },
"stories": 1
}`;

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
          {
            type: "text" as const,
            text: `Image ${index + 1}:`,
          },
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

    const generationPromise = client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            ...imageParts.flat(),
            {
              type: "text",
              text: "Analyze all images and return the JSON result.",
            },
          ],
        },
      ],
    });

    const result = await Promise.race([generationPromise, timeoutPromise]) as Anthropic.Message;

    const rawText = result.content[0].type === "text" ? result.content[0].text : "";

    // Extract JSON even if model wraps it in markdown
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("AI Parsing Error:", rawText);
      return NextResponse.json({ error: "Failed to parse estimation data." }, { status: 500 });
    }
    const cleanText = jsonMatch[0].trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanText);
    } catch (e) {
      console.error("AI Parsing Error:", rawText);
      return NextResponse.json({ error: "Failed to parse estimation data." }, { status: 500 });
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Estimation Error:", error);
    const message = error.message || "An unexpected error occurred.";
    const status = message.includes("Timeout") ? 504 : 500;
    return NextResponse.json({ error: message }, { status: status });
  }
}