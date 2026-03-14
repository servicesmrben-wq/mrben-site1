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
    // 1. Authenticate using the Service Account credentials
    // IMPORTANT: In Vercel, the Private Key must have escaped newlines replaced
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const projectId = "529910920022"; // Using the Numeric ID for maximum reliability
    
    if (!clientEmail || !privateKey) {
      console.error("Missing credentials in Environment Variables.");
      return NextResponse.json({ error: "Server configuration error: Missing credentials" }, { status: 500 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Convert all files to inline Base64 parts for the AI
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

    // 2. Initialize the official Vertex AI SDK
    const vertexAI = new VertexAI({
      project: projectId,
      location: "us-central1",
      googleAuthOptions: {
        credentials: {
          client_email: clientEmail,
          private_key: privateKey, 
        }
      }
    });

    // 3. Define the model using the numeric Resource ID
    // Note: Tuned models usually live in /tunedModels/ but gcloud describe showed /models/
    // The SDK's getGenerativeModel is the most robust way to handle this.
    const model = vertexAI.getGenerativeModel({ 
      model: "projects/529910920022/locations/us-central1/models/7631049401904922624",
      systemInstruction: `You are an expert window cleaning estimator. Analyze the images and count structurally framed glass panels. 
      IGNORE DECORATIVE GRIDS. 
      Return JSON: { "analysis": "...", "window_counts": { "pane_3rd_story": 0, "pane_2nd_story": 0, "pane_1st_base": 0, "patio_door_panel": 0 }, "stories": 1 }`
    });

    // Timeout logic to prevent Vercel 504s
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request Timeout after 58s")), 58000);
    });

    const generationPromise = model.generateContent({
      contents: [{ role: "user", parts: imageParts }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.0,
      },
    });

    // 4. Execute the call with Hardened Error Handling
    let result: any;
    try {
      result = await Promise.race([generationPromise, timeoutPromise]);
    } catch (apiError: any) {
      console.error("VERTEX AI SDK ERROR:", apiError.message);
      // This will catch the 404, 403, or 401 and print the EXACT message from Google
      return NextResponse.json({ 
        error: "Vertex AI call failed", 
        details: apiError.message 
      }, { status: 500 });
    }

    // Extract and return the AI text
    const rawText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawText) {
      console.error("EMPTY RESPONSE FROM AI. Full Result:", JSON.stringify(result));
      return NextResponse.json({ error: "AI returned no data", raw: JSON.stringify(result) }, { status: 500 });
    }

    const cleanText = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    return NextResponse.json(JSON.parse(cleanText));

  } catch (error: any) {
    console.error("CRITICAL ROUTE ERROR:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}
