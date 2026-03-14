import { VertexAI } from "@google-cloud/vertexai";
import { NextResponse } from "next/server";

export const maxDuration = 60; 
export const runtime = "nodejs";

// WARM-UP HANDLER
export async function GET() {
  return NextResponse.json({ status: "Server is awake and ready." }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    // 1. Fix Vercel environment variable formatting bug
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!clientEmail || !privateKey || !projectId) {
      console.error("Missing credentials:", { clientEmail: !!clientEmail, privateKey: !!privateKey, projectId: !!projectId });
      return NextResponse.json(
        { error: "Server configuration error: Missing Vertex AI Credentials or Project ID" },
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

    // 2. Initialize Vertex AI with cleaned privateKey
    const vertexAI = new VertexAI({
      project: projectId,
      location: "us-central1", // Standard region for Vertex AI
      googleAuthOptions: {
        credentials: {
          client_email: clientEmail,
          private_key: privateKey, 
        }
      }
    });

const model = vertexAI.getGenerativeModel({ 
  model: "projects/gen-lang-client-0569585575/locations/us-central1/tunedModels/mrben-pane-counter-v4",
      systemInstruction: `You are an expert window cleaning estimator. Your task is to analyze the provided images and count the total number of individual, structurally framed glass panels.

CRITICAL VISUAL RULES:

THE SQUEEGEE RULE (What to count): A "panel" is a continuous sheet of glass fully enclosed by a thick, primary structural frame. Think of a panel as a single glass surface that requires its own distinct cleaning motion. If a physical frame separates two pieces of glass, they are two separate panels.
- A standard double-hung or sliding window = 2 panels.
- A large bay window with a big center glass and two smaller angled side glasses = 3 panels.
- IGNORE DECORATIVE GRIDS (Muntins/Grilles): Do not count tiny squares inside a window. Treat the entire grid-covered area as one single glass panel.

OBSTRUCTIONS & SHADOWS: Actively look behind plastic winter shelters, tanks, and into deep shadows. Do not miss partially hidden basement windows.

TRANSOMS: Windows above doors count as separate panels (map to 1st floor).

BASEMENT: Count 2 panels per standard sliding basement unit. Look closely at the foundation line.

DOORS: Count each panel of sliding/entry doors as 'patio_door_panel'.

SPATIAL MAPPING (Top-Down):
(Note: Keep output keys as 'pane_' for system compatibility)
3rd Story -> 'pane_3rd_story'
2nd Story -> 'pane_2nd_story'
Main/Basement -> 'pane_1st_base'

OUTPUT FORMAT:
Return JSON ONLY. Use the 'analysis' field to briefly perform step-by-step reasoning per image using the Squeegee Rule before outputting the final counts.
{
"analysis": "Img 1: Found 1 bay window (3 panels), plus 1 sliding basement window (2 panels). Ignored decorative grids...",
"window_counts": { "pane_3rd_story": 0, "pane_2nd_story": 0, "pane_1st_base": 0, "patio_door_panel": 0 },
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

    // 3. Hardened response check
    let result: any;
    try {
      result = await Promise.race([generationPromise, timeoutPromise]);
    } catch (raceError: any) {
      console.error("DEBUG: Request failed:", raceError.message);
      return NextResponse.json({ error: "AI Generation Failed", details: raceError.message }, { status: 500 });
    }

    // Check if the response exists and has candidates (equivalent to response.ok check)
    if (!result?.response?.candidates?.[0]) {
      console.error("HARDENED CHECK: No candidates returned. Raw result:", JSON.stringify(result));
      return NextResponse.json({ 
        error: "Unexpected end of JSON input", 
        raw: JSON.stringify(result) 
      }, { status: 500 });
    }

    const rawText = result.response.candidates[0].content.parts[0].text;
    
    if (!rawText) {
      console.error("HARDENED CHECK: AI returned empty text. Raw:", JSON.stringify(result));
      return NextResponse.json({ 
        error: "AI returned empty response", 
        raw: JSON.stringify(result) 
      }, { status: 500 });
    }

    const cleanText = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(cleanText);
    } catch (e) {
      console.error("AI Parsing Error:", rawText);
      return NextResponse.json({ error: "Failed to parse estimation data.", raw: rawText }, { status: 500 });
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
