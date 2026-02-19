import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    
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

    // Convert all files to base64 parts
    const imageParts = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return {
          inlineData: {
            data: buffer.toString("base64"),
            mimeType: file.type,
          },
        };
      })
    );

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert window cleaning estimator. Analyze these photos of a house.

CRITICAL DEFINITION OF A "PANE" (standard_pane):
- A "Pane" is a single sheet of glass surrounded by a **structural frame** (vinyl, wood, aluminum).
- **DO NOT COUNT** decorative grids, lead lines, muntins, or internal dividers as separate panes.
  - Example: A window with a 2x3 grid pattern is ONE pane if it is a single sheet of glass.
  - Example: A window with true divided lites (separate glass pieces) counts as multiple panes, but this is rare in modern windows. Assume grids are decorative unless obvious otherwise.
- **Entry Doors:** Count a decorative glass insert (leaded/stained/frosted) as **ONE pane**, regardless of the pattern inside.
- **Sliding Windows:**
  - A standard slider has **2 Panes** (one fixed, one sliding).
  - A double (storm) slider has **4 Panes** (2 inner + 2 outer).
- **Hung Windows:** A standard single-hung or double-hung has **2 Panes** (top sash + bottom sash).

CATEGORIES:
1. **standard_pane:** Count every distinct structural pane according to the rules above.
2. **patio_door_2panel:** Count standard sliding glass door assemblies (count the *door set*, not the individual glass panels). 
   - Note: If counting the door set as '1' is confusing, just count its glass panels as 'standard_pane' (2 panes per door). 
   - **PREFERENCE:** Count Patio Doors as 'patio_door_2panel' (1 count per door assembly).

OUTPUT FORMAT:
Return JSON ONLY with no markdown:
{ 
  "window_counts": { 
    "standard_pane": 0, 
    "patio_door_2panel": 0
  }, 
  "stories": 1, 
  "audio_summary": "None" 
}`;

    const result = await model.generateContent([
      prompt,
      ...imageParts
    ]);

    const responseText = result.response.text();
    
    // Clean up potential markdown formatting
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse AI response:", responseText);
      return NextResponse.json({ error: "Failed to parse estimation data" }, { status: 500 });
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Estimation error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during estimation" },
      { status: 500 }
    );
  }
}
