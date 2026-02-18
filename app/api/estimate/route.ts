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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `You are an expert window cleaning estimator. Analyze these photos of a house.
1. Count the TOTAL windows visible across ALL photos. Be careful not to double-count if the same window appears in multiple overlapping photos, but try to be comprehensive.
2. Categorize them by these specific keys:
   - std_hung (Standard vertical sliding)
   - std_fixed (Casement or fixed/non-opening)
   - alum_double_slider (Old aluminum style with 2 sets of glass/tracks)
   - small_french (Individual small panes)
   - large_picture (Large floor-to-ceiling glass)
   - arch_special (Round, triangular, or architectural shapes)

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
  "audio_summary": "None" 
}`;

    // Note: audio_summary will be "None" since we are using images, but keeping the schema consistent
    // allows the frontend to handle it gracefully.

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
