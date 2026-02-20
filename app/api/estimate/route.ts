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
      // Removed codeExecution to reduce latency
    });

    const prompt = `You are an expert window cleaning estimator. Analyze these photos of a house.

SPATIAL SCAN: You must still scan floor-by-floor (Top, Main, Basement), but keep the 'analysis' output field extremely brief using math shorthand. DO NOT write full sentences.
Example format: 'Top: 3(comp)+2+3(comp)=8. Main: 6(split)+3(transom)+6(split)=15. Base: 2(sliders x2)=4. Door: 1(3-panel). Total panes: 27.'

Apply these visual rules silently:
- MULLIONS & HORIZONTAL SPLITS: Count every distinct glass pane separated by a thick frame.
- TRANSOMS: Windows above patio/entry doors count separately.
- BASEMENT SHADOWS: Most basement windows are sliders. Count 2 panes per sliding unit.

COUNTING RULES:
1. **Standard Slider (window_slider):** Identify horizontal sliding windows. They typically have 2 sashes (one fixed, one sliding). Count the entire window unit as **1** (accounting for 2 panes).
2. **Casement / Picture (window_casement):** Identify single-pane crank-out windows or non-opening picture windows. Count each distinct pane as **1**.
3. **Entry Door Glass (entry_door_glass):** Identify glass inserts in front/side doors. Count the entire insert as **1**.
4. **Sliding Patio Door Panels (patio_door_panel):** Identify sliding patio door assemblies. You MUST count EACH large glass panel (both the sliding panels and the fixed panels) within the assembly as 1 'patio_door_panel'. For example, a wide sliding door with 3 distinct glass panels = 3 'patio_door_panel'.

OUTPUT FORMAT:
Return JSON ONLY with no markdown. The "analysis" field is mandatory but must be concise.
{ 
  "analysis": "Top: 2+2=4. Main: 3(comp)=3. Base: 2. Total: 9.",
  "window_counts": { 
    "window_slider": 0, 
    "window_casement": 0,
    "entry_door_glass": 0,
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
