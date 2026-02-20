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
      tools: [{ codeExecution: {} }] 
    });

    const prompt = `You are an expert window cleaning estimator. Analyze these photos of a house.

CRITICAL INSTRUCTION - STEP-BY-STEP SPATIAL ANALYSIS:
Before providing the final counts, you MUST conduct a floor-by-floor, left-to-right visual scan of the property.

**SCANNING PROTOCOL:**
1. **Start at the Top Floor**, scanning Left to Right.
2. **Move to the Main Floor**, scanning Left to Right.
3. **End at the Basement/Ground Level**, scanning Left to Right.

**MANDATORY CHECKS:**
When conducting your scan, you MUST execute these specific checks:
1. **THE HORIZONTAL CHECK:** After counting vertical mullions in a large assembly, explicitly check for horizontal structural frames. If a unit is split into top and bottom sections, multiply your count. 
   - *Example:* "Main floor left: 3 vertical sections, split horizontally into top and bottom = 6 panes."
2. **THE TRANSOM CHECK:** Whenever you identify a 'patio_door_panel' or entry door, you must explicitly look directly ABOVE the door frame for transom windows and count them separately as 'window_casement'.
3. **THE SHADOW CHECK (Basement/Foundation):** Pay extreme attention to the dark foundation line to spot small basement windows. CRITICAL: When you identify a basement window, DO NOT just count the unit as '1'. You must inspect the glass. Many basement windows are horizontal sliders containing 2 distinct glass panes. You MUST count each pane separately. (e.g., If you see 1 basement slider, count it as 2 'window_casement' panes. If you see a single-pane hopper, count it as 1).

COUNTING RULES:
1. **Standard Slider (window_slider):** Identify horizontal sliding windows. They typically have 2 sashes (one fixed, one sliding). Count the entire window unit as **1** (accounting for 2 panes).
2. **Casement / Picture (window_casement):** Identify single-pane crank-out windows or non-opening picture windows. Count each distinct pane as **1**.
3. **Entry Door Glass (entry_door_glass):** Identify glass inserts in front/side doors. Count the entire insert as **1**.
4. **Sliding Patio Door Panels (patio_door_panel):** Identify sliding patio door assemblies. You MUST count EACH large glass panel (both the sliding panels and the fixed panels) within the assembly as 1 'patio_door_panel'. For example, a wide sliding door with 3 distinct glass panels = 3 'patio_door_panel'.

OUTPUT FORMAT:
Return JSON ONLY with no markdown. The "analysis" field is mandatory and must contain your step-by-step logic.
{ 
  "analysis": "Top floor left: 1 picture, 2 side panes (3 total). Top floor middle: 2 casements (2 total)... Total calculated: 25 panes.",
  "window_counts": { 
    "window_slider": 0, 
    "window_casement": 0,
    "entry_door_glass": 0,
    "patio_door_panel": 0
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
