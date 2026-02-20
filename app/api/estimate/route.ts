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

CRITICAL INSTRUCTION - STEP-BY-STEP SPATIAL ANALYSIS:
Before providing the final counts, you MUST conduct a floor-by-floor, left-to-right visual scan of the property to ensure nothing is missed or merged.
1. **Start at the Top Floor**, scanning Left to Right.
2. **Move to the Main Floor**, scanning Left to Right.
3. **End at the Basement/Ground Level**, scanning Left to Right.
4. **Dissect Assemblies:** For EVERY large window assembly you encounter, explicitly state how many structural dividers (mullions) you see and calculate the individual panes.
   - Example: "Main floor, far left: 1 large assembly split by mullions into 3 top panes and 3 bottom panes = 6 'window_casement' panes."
   - Example: "Center: 1 large picture window flanked by 2 narrow casements = 3 'window_casement' panes."

CATEGORIES & COUNTING:
1. **Standard Slider (window_slider):** Horizontal sliding window (usually 2 sashes). Count the unit as **1** (which covers 2 panes).
2. **Casement / Picture (window_casement):** Any single fixed or crank-out pane. Use this category for *every* individual pane found in a composite/mullion assembly.
3. **Entry Door Glass (entry_door_glass):** Glass insert in a door. Count the insert as **1**.
4. **Sliding Patio Door (patio_door_2panel):** Standard sliding door assembly. Count the assembly as **1** (covers 2 panels).

OUTPUT FORMAT:
Return JSON ONLY with no markdown. The "analysis" field is mandatory and must contain your step-by-step logic.
{ 
  "analysis": "Top floor left: 1 picture, 2 side panes (3 total). Top floor middle: 2 casements (2 total)... Total calculated: 25 panes.",
  "window_counts": { 
    "window_slider": 0, 
    "window_casement": 0,
    "entry_door_glass": 0,
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
