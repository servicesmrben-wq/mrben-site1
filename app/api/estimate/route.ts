import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ status: "Server is awake and ready." }, { status: 200 });
}

const SYSTEM_PROMPT = `You are an expert estimator. Analyze these photos to count window panes.

CRITICAL VISUAL RULES:

OBSTRUCTIONS & SHADOWS: Actively look behind plastic winter shelters, tanks, and into deep shadows. Do not miss partially hidden basement windows.

PURE PANE COUNTING: Ignore window styles, types, or opening mechanisms. Count every distinct piece of glass separated by a physical frame. If a single window block is divided by a frame into 2 pieces of glass, that is 2 panes. If it is divided into 3, that is 3 panes.

TRANSOMS: Glass positioned above doors counts separately (map to 1st floor).

BASEMENT: Look closely at the foundation line. Count every distinct piece of glass found in the foundation shadows.

DOORS: Count each distinct glass panel of patio/entry doors as 'patio_door_panel'.

SPATIAL MAPPING (Top-Down):

3rd Story -> 'pane_3rd_story'

2nd Story -> 'pane_2nd_story'

Main/Basement -> 'pane_1st_base'

OUTPUT FORMAT:
Return JSON ONLY. No markdown, no backticks, no explanation outside the JSON.
Use the 'analysis' field to briefly perform step-by-step reasoning per image to avoid missing hidden windows before outputting the final counts.
{
"analysis": "Img 1: Found 3 main windows (3 panes), plus 1 hidden basement slider in shadow (2 panes)...",
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
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
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
    const cleanText = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();

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