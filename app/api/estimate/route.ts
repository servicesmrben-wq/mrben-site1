import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60; 
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

    // OPTIMIZATION: Use 'gemini-1.5-flash' for sub-5s latency
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
    });

    const prompt = `You are an expert window cleaning estimator. Analyze these photos of a house.

SPATIAL SCAN (ELEVATION BASED):
Scan floor-by-floor (Top-Down). Map pane counts to elevation.
- **3rd Story** (if present) -> 'pane_3rd_story'
- **2nd Story** -> 'pane_2nd_story'
- **Main/Basement** -> 'pane_1st_base'
- **Doors** -> 'patio_door_panel'

COUNTING RULES:
1. **MULLIONS:** Count every distinct glass pane. Slider = 2 panes. Hung = 2 panes.
2. **TRANSOMS:** Windows above doors count separately (map to 1st floor).
3. **BASEMENT:** Count 2 panes per sliding basement unit.
4. **DOORS:** Count each panel of sliding/entry doors as 'patio_door_panel'.

OUTPUT FORMAT:
Return JSON ONLY. Keep 'analysis' VERY short (max 20 words).
{ 
  "analysis": "2nd: 6. Main: 10. Base: 4. Doors: 2.",
  "window_counts": { 
    "pane_3rd_story": 0,
    "pane_2nd_story": 0,
    "pane_1st_base": 0,
    "patio_door_panel": 0
  }, 
  "stories": 1, 
  "audio_summary": "None" 
}`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            ...imageParts
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const rawText = result.response.text();
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
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
