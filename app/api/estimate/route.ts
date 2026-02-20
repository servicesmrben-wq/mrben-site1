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

ENHANCED VISUAL COUNTING RULES:

**CRITICAL RULE: Composite/Multi-Pane Assemblies (Mullions)**
* **The Problem:** Modern homes often group several windows together in one large structural opening (e.g., a large center picture window with two smaller side windows).
* **The Rule:** Do NOT count the entire large assembly as "1". You MUST look inside the large outer frame. Every time a thick structural frame (mullion) divides the glass, count each resulting rectangular piece of glass as a separate pane.
* **Examples:**
  - A large living room unit with 1 big center pane and 2 side panes = Count as **3** 'window_casement' panes.
  - A large unit with 3 tall windows on top and 3 smaller awning windows on the bottom = Count as **6** 'window_casement' panes.
  - A transom window (narrow glass) sitting directly above a patio door = Count the transom separately as a 'window_casement' (do not merge it into the door count).

CATEGORIES & COUNTING:
1. **Standard Slider (window_slider):** Horizontal sliding window (usually 2 sashes). Count the unit as **1** (which covers 2 panes).
2. **Casement / Picture (window_casement):** Any single fixed or crank-out pane. Use this category for *every* individual pane found in a composite/mullion assembly.
3. **Entry Door Glass (entry_door_glass):** Glass insert in a door. Count the insert as **1**.
4. **Sliding Patio Door (patio_door_2panel):** Standard sliding door assembly. Count the assembly as **1** (covers 2 panels).

OUTPUT FORMAT:
Return JSON ONLY with no markdown:
{ 
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
