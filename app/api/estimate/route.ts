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
    // 1. Check for your specific Vertex AI Vercel environment variables
    if (
      !process.env.GOOGLE_CLOUD_PROJECT_ID ||
      !process.env.VERTEX_ENDPOINT_ID ||
      !process.env.GOOGLE_CLIENT_EMAIL ||
      !process.env.GOOGLE_PRIVATE_KEY
    ) {
      return NextResponse.json(
        { error: "Server configuration error: Missing Vertex AI credentials or Endpoint ID" },
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

    // 2. Initialize Vertex AI with the explicit Service Account credentials
    const vertex_ai = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: 'us-central1',
      googleAuthOptions: {
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), 
        }
      }
    });

    // 3. Construct the specific endpoint path for your deployed model
    const endpointPath = `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/us-central1/endpoints/${process.env.VERTEX_ENDPOINT_ID}`;

    const generativeModel = vertex_ai.getGenerativeModel({ 
      model: endpointPath,
      // UPDATED PROMPT: Force single-property evaluation and strict single JSON output
      systemInstruction: `You are an expert estimator. Analyze ALL provided photos AS A SINGLE PROPERTY to count window panes. 

CRITICAL MULTI-IMAGE RULE:
Cross-reference the photos to identify overlapping angles. DO NOT double-count the same window if it appears in multiple images. Synthesize the images to understand the whole house.

CRITICAL VISUAL RULES:
OBSTRUCTIONS & SHADOWS: Actively look behind plastic winter shelters, tanks, and into deep shadows. Do not miss partially hidden basement windows.
MULLIONS: Count every distinct glass pane separated by a frame. Look closely at large window blocks: if a frame divides it, count each section (e.g., a 3-section window = 3 panes). Standard slider/hung = 2 panes.
TRANSOMS: Windows above doors count separately (map to 1st floor).
BASEMENT: Count 2 panes per sliding basement unit. Look closely at the foundation line.
DOORS: Count each panel of sliding/entry doors as 'patio_door_panel'.

SPATIAL MAPPING (Top-Down):
3rd Story -> 'pane_3rd_story'
2nd Story -> 'pane_2nd_story'
Main/Basement -> 'pane_1st_base'

OUTPUT FORMAT:
Return EXACTLY ONE single JSON object representing the grand total for the entire house. DO NOT return an array. Use the 'analysis' field to briefly perform step-by-step reasoning across all images to avoid missing or double-counting windows.
{
"analysis": "Cross-referencing images: Found 3 main windows on the left (Img 1 & 2 overlap, counted once). Found 1 hidden basement slider...",
"window_counts": { "pane_3rd_story": 0, "pane_2nd_story": 0, "pane_1st_base": 0, "patio_door_panel": 0 },
"stories": 1
}`
    });

    // Timeout logic: 58 seconds to beat Vercel's 60s limit
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request Timeout")), 58000);
    });

    const generationPromise = generativeModel.generateContent({
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

    // --- DEBUGGING LOGS START HERE ---
    console.log("🔍 FULL VERTEX RESPONSE:", JSON.stringify(result.response, null, 2));

    const rawText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("📝 EXTRACTED RAW TEXT:", rawText);

    const cleanText = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    
    let parsedData;
    try {
      if (!cleanText) {
         throw new Error("Model returned an empty string");
      }
      
      let rawParsed = JSON.parse(cleanText);
      
      // THE FALLBACK REDUCER: If the model still returns an array of objects, squash them into one.
      if (Array.isArray(rawParsed)) {
        parsedData = {
          analysis: "Aggregated from multiple outputs:\n",
          window_counts: { pane_3rd_story: 0, pane_2nd_story: 0, pane_1st_base: 0, patio_door_panel: 0 },
          stories: 1
        };
        
        rawParsed.forEach(item => {
          if (item.analysis) parsedData.analysis += item.analysis + "\n";
          
          if (item.window_counts) {
            parsedData.window_counts.pane_3rd_story += item.window_counts.pane_3rd_story || 0;
            parsedData.window_counts.pane_2nd_story += item.window_counts.pane_2nd_story || 0;
            parsedData.window_counts.pane_1st_base += item.window_counts.pane_1st_base || 0;
            parsedData.window_counts.patio_door_panel += item.window_counts.patio_door_panel || 0;
          }
          
          if (item.stories > parsedData.stories) {
            parsedData.stories = item.stories;
          }
        });
        console.log("⚠️ MODEL RETURNED ARRAY. AGGREGATED FINAL JSON:", parsedData);
      } else {
        parsedData = rawParsed;
        console.log("✅ SUCCESSFULLY PARSED SINGLE JSON:", parsedData);
      }
      
    } catch (e) {
      console.error("❌ AI Parsing Error. Raw Text was:", rawText);
      return NextResponse.json({ error: `Failed to parse estimation data. Check Vercel logs.` }, { status: 500 });
    }
    // --- DEBUGGING LOGS END HERE ---

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Estimation Error:", error);
    const message = error.message || "An unexpected error occurred.";
    const status = message.includes("Timeout") ? 504 : 500;
    
    return NextResponse.json(
      { error: message },
      { status: status }
    );
  }
}