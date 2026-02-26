import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60; 
export const runtime = "nodejs";

// WARM-UP HANDLER
export async function GET() {
  return NextResponse.json({ status: "Server is awake and ready." }, { status: 200 });
}

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

    // Convert all files to inline Base64 parts
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
      model: "gemini-2.5-flash",
      systemInstruction: `You are an expert estimator. Analyze these photos to count distinct window sections.

CRITICAL VISUAL RULES:

OBSTRUCTIONS & SHADOWS: Actively look behind plastic winter shelters, tanks, and into deep shadows. Do not miss partially hidden basement windows.

SECTIONS OVER PANES: Count the entire window frame or section as a single unit. Do not count individual pieces of glass divided by thin mullions. A standard sliding window frame = 1 section. A massive 3-part bay window = 1 section.

TRANSOMS: Windows above doors count separately (map to 1st floor).

BASEMENT: Count each distinct window frame found along the foundation line.

DOORS: Count each sliding/entry door that contains glass as 'patio_door_panel'.

SPATIAL MAPPING (Top-Down):
3rd Story -> 'section_3rd_story'
2nd Story -> 'section_2nd_story'
Main/Basement -> 'section_1st_base'

OUTPUT FORMAT:
Return JSON ONLY. Use the 'analysis' field to briefly perform step-by-step reasoning per image to avoid missing hidden windows before outputting the final counts.
{
"analysis": "Img 1: Found 3 main window sections, plus 1 hidden basement section in shadow...",
"window_counts": { "section_3rd_story": 0, "section_2nd_story": 0, "section_1st_base": 0, "patio_door_panel": 0 },
"stories": 1
}`
    });

    // Timeout logic: 58 seconds to beat Vercel's 60s limit
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request Timeout")), 58000);
    });

    const generationPromise = model.generateContent({
      contents: [
        {
          role: "user",
          parts: imageParts
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.0,
      },
    });

    // Race the generation against the timeout
    const result = await Promise.race([generationPromise, timeoutPromise]) as any;

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
    const message = error.message || "An unexpected error occurred.";
    
    // Return 504 specifically for timeouts so frontend retry logic catches it
    const status = message.includes("Timeout") ? 504 : 500;
    
    return NextResponse.json(
      { error: message },
      { status: status }
    );
  }
}
