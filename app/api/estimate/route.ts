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

COUNTING RULES (CRITICAL):
**COUNT EVERY INDIVIDUAL PANE OF GLASS.**
- A standard 2-panel slider = **2 counts**.
- A 3-panel window = **3 counts**.
- A standard double-hung (top/bottom) = **2 counts**.
- A patio door (2 glass panels) = **2 counts**.
- A patio door (3 glass panels) = **3 counts**.
- EXCEPTION: **French Panes (small_french)**: Count each tiny square individually.

CATEGORIES (Assign each pane to its type):
- **std_hung:** Pane part of a vertical sliding window.
- **window_slider_standard:** Pane part of a horizontal sliding sash.
- **slider_double_set:** Pane part of a double/storm slider assembly (inner or outer glass).
- **std_fixed:** Single fixed pane (casement or picture).
- **alum_double_slider:** Pane part of a vintage aluminum slider.
- **patio_door_2panel:** Large glass door panel.
- **entry_door_glass:** Glass pane inside a front door.
- **small_french:** Individual small square pane.
- **large_picture:** Oversized floor-to-ceiling fixed glass.
- **arch_special:** Custom shape pane.

OUTPUT FORMAT:
Return JSON ONLY with no markdown:
{ 
  "window_counts": { 
    "std_hung": 0, 
    "window_slider_standard": 0,
    "slider_double_set": 0,
    "std_fixed": 0, 
    "alum_double_slider": 0, 
    "patio_door_2panel": 0,
    "entry_door_glass": 0,
    "small_french": 0, 
    "large_picture": 0, 
    "arch_special": 0 
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
