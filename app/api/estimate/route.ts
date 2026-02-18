import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Or 'edge' if preferred, but nodejs handles file buffers well

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
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const mimeType = file.type;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert window cleaning estimator. Analyze the provided video/image.
1. Count windows and categorize them by these specific keys:
   - std_hung (Standard vertical sliding)
   - std_fixed (Casement or fixed/non-opening)
   - alum_double_slider (Old aluminum style with 2 sets of glass/tracks)
   - small_french (Individual small panes)
   - large_picture (Large floor-to-ceiling glass)
   - arch_special (Round, triangular, or architectural shapes)

2. Listen to the audio (if present) for specific user requests (e.g., 'skip the basement', 'screen is broken', 'focus on the top floor').

3. Return JSON ONLY in this format, with no markdown code blocks:
{ 
  "window_counts": { 
    "std_hung": 0, 
    "std_fixed": 0, 
    "alum_double_slider": 0, 
    "small_french": 0, 
    "large_picture": 0, 
    "arch_special": 0 
  }, 
  "stories": 1, 
  "audio_summary": "Summary of audio instructions or 'None' if silent" 
}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);

    const responseText = result.response.text();
    
    // Clean up potential markdown formatting if the model adds it
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
