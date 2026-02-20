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
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      // Removed codeExecution
    });

    const prompt = `You are an expert window cleaning estimator. Analyze these photos of a house.

SPATIAL SCAN (ELEVATION BASED):
You must scan floor-by-floor (Top-Down) and map your pane counts to their elevation. Keep the 'analysis' output field extremely brief using math shorthand.
- **3rd Story** (if present): Map counts to 'pane_3rd_story'.
- **2nd Story**: Map counts to 'pane_2nd_story'.
- **Main Floor & Basement**: Combine these pane counts and map to 'pane_1st_base'.
- **Doors**: Keep all patio doors and entry door glass mapped to 'patio_door_panel'.

Example Analysis: "3rd: 0. 2nd: 8. Main+Base: 15+2=17. Doors: 3. Total: 28."

COUNTING RULES:
1. **MULLIONS & HORIZONTAL SPLITS:** Count every distinct glass pane separated by a thick frame. A standard slider = 2 panes. A standard hung = 2 panes.
2. **TRANSOMS:** Windows above patio/entry doors count separately (map them to their floor elevation, usually 1st).
3. **BASEMENT SHADOWS:** Count 2 panes per sliding basement unit. Map these to 'pane_1st_base'.
4. **DOORS:** Count each panel of a sliding door or glass insert in an entry door as 'patio_door_panel'.

OUTPUT FORMAT:
Return JSON ONLY with no markdown.
{ 
  "analysis": "2nd: 6. Main: 8+2=10. Base: 4. Doors: 2.",
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
    
    // Aggressively strip markdown backticks just in case
    const cleanText = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse AI response:", rawText);
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
