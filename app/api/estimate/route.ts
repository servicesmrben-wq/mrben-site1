import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextResponse } from "next/server";
import * as fs from "fs/promises";
import { unlinkSync } from "fs";
import * as os from "os";
import * as path from "path";

export const maxDuration = 60; 
export const runtime = "nodejs";

// WARM-UP HANDLER
export async function GET() {
  return NextResponse.json({ status: "Server is awake and ready." }, { status: 200 });
}

export async function POST(req: Request) {
  const tempFilePaths: string[] = [];

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

    const fileManager = new GoogleAIFileManager(apiKey);

    // Parallel processing with strict tracking
    const fileParts = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Create a unique temporary file path
        const tempFilePath = path.join(os.tmpdir(), `upload-${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`);
        tempFilePaths.push(tempFilePath); // Track immediately
        
        // Write buffer to temp file
        await fs.writeFile(tempFilePath, buffer);
        
        // Upload to Gemini
        const uploadResponse = await fileManager.uploadFile(tempFilePath, {
          mimeType: file.type,
          displayName: file.name,
        });
        
        // We do NOT delete here anymore to ensure strict cleanup in finally block handles everything,
        // or we can delete here and remove from array? 
        // The prompt says "In the finally block, ensure you explicitly delete...". 
        // So we leave it for the finally block or do both (redundant but safe). 
        // Doing it here frees space faster. Doing it in finally ensures safety.
        // I will do it in finally to satisfy the "Strict Cleanup" requirement perfectly.
        
        return {
          fileData: {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri,
          },
        };
      })
    );

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      systemInstruction: `You are an expert estimator. Analyze these photos.
SPATIAL SCAN (ELEVATION BASED): Scan top-down. 
- 3rd Story (if present) -> 'pane_3rd_story'
- 2nd Story -> 'pane_2nd_story'
- Main/Basement -> 'pane_1st_base'
- Doors -> 'patio_door_panel'

RULES:
1. MULLIONS: Count every distinct glass pane separated by a frame. A standard Slider = 2 panes. A standard Hung = 2 panes.
2. TRANSOMS: Windows above doors count separately (map to 1st floor).
3. BASEMENT: Count 2 panes per sliding basement unit.
4. DOORS: Count each panel of sliding/entry doors as 'patio_door_panel'.

OUTPUT FORMAT:
Return JSON ONLY. Keep 'analysis' brief using math shorthand (e.g., '2nd: 8. Main: 12.').
{ 
  "analysis": "...", 
  "window_counts": { "pane_3rd_story": 0, "pane_2nd_story": 0, "pane_1st_base": 0, "patio_door_panel": 0 },
  "stories": 1,
  "audio_summary": "None"
}`
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: fileParts
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.0,
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
  } finally {
    // Strict Cleanup: Ensure all temp files are deleted
    if (tempFilePaths.length > 0) {
      for (const filePath of tempFilePaths) {
        try {
          unlinkSync(filePath);
        } catch (e) {
          // Ignore errors if file already deleted or doesn't exist
          console.warn(`Cleanup warning for ${filePath}:`, e);
        }
      }
    }
  }
}
