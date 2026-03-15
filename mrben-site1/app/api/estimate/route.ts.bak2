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
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    
    if (!clientEmail || !privateKey || !projectId) {
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

    // Initialize Vertex AI
    const vertexAI = new VertexAI({
      project: projectId,
      location: "us-central1",
      googleAuthOptions: {
        credentials: {
          client_email: clientEmail,
          private_key: privateKey.replace(/\\n/g, '\n'), 
        }
      }
    });

    const model = vertexAI.getGenerativeModel({ 
      model: "projects/gen-lang-client-0569585575/locations/us-central1/tunedModels/mrben-pane-counter-v4",
      systemInstruction: `You are an expert window cleaning estimator. Your task is to analyze the provided images and count the total number of individual, structurally framed glass panels.

      CRITICAL VISUAL RULES:
      THE SQUEEGEE RULE: A "panel" is a continuous sheet of glass fully enclosed by a thick, primary structural frame. 
      - A standard double-hung or sliding window = 2 panels.
      - IGNORE DECORATIVE GRIDS.
      
      OUTPUT FORMAT:
      Return JSON ONLY.
      {
        "analysis": "...",
        "window_counts": { "pane_3rd_story": 0, "pane_2nd_story": 0, "pane_1st_base": 0, "patio_door_panel": 0 },
        "stories": 1
      }`
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request Timeout")), 58000);
    });

    const generationPromise = model.generateContent({
      contents: [{ role: "user", parts: imageParts }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.0,
      },
    });

    // 1. Race logic
    const result = await Promise.race([generationPromise, timeoutPromise]) as any;

    // 2. Safety check: Did we get a response at all?
    if (!result?.response?.candidates?.[0]) {
      console.error("CRITICAL: Vertex AI returned an empty candidate list.", JSON.stringify(result));
      throw new Error("Empty AI Response - Check IAM Permissions for 'Vertex AI User'");
    }

    // 3. Extract text with fallback
    const rawText = result.response.candidates[0].content?.parts?.[0]?.text || "";
    console.log("DEBUG: Raw AI Response:", rawText);

    if (!rawText || rawText.length < 2) {
      throw new Error("AI returned an empty string. Possibly a cold-start or safety filter block.");
    }

    const cleanText = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(cleanText);
    } catch (e) {
      console.error("AI JSON Parse Error. Raw text was:", rawText);
      return NextResponse.json({ error: "Failed to parse estimation data.", raw: rawText }, { status: 500 });
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Estimation Error:", error);
    
    // Specifically catch permission/auth errors that cause sub-second failures
    if (error.message?.includes("Permission") || error.message?.includes("403")) {
      return NextResponse.json({ error: "Permission Denied: Ensure Service Account has 'Vertex AI User' role." }, { status: 403 });
    }

    const status = error.message?.includes("Timeout") ? 504 : 500;
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status });
  }
}