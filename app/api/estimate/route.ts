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

    // Initialize Vertex AI with the Service Account credentials
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
      systemInstruction: `You are an expert window cleaning estimator. Your task is to analyze the provided images and count the total number of individual, structurally framed glass panels. Use the Squeegee Rule. Output JSON only.`
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

    // 1. Race the generation
    const result = await Promise.race([generationPromise, timeoutPromise]) as any;

    // 2. Safety Check: Did Google actually return a valid candidate?
    if (!result?.response?.candidates?.[0]?.content?.parts?.[0]) {
      console.error("CRITICAL: Vertex AI returned an empty response object:", JSON.stringify(result));
      return NextResponse.json({ 
        error: "The AI returned an empty response. This is usually a permission or 'Cold Start' issue.",
        details: "Check Vercel logs for the full stringified result."
      }, { status: 500 });
    }

    // 3. Extract text safely
    const rawText = result.response.candidates[0].content.parts[0].text || "";
    const cleanText = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    
    if (!cleanText) {
       console.error("AI returned empty text. Candidate status:", result.response.candidates[0].finishReason);
       return NextResponse.json({ error: "AI returned no content." }, { status: 500 });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(cleanText);
    } catch (e) {
      console.error("AI Parsing Error. Raw Text was:", rawText);
      return NextResponse.json({ error: "Failed to parse estimation data.", rawResponse: rawText }, { status: 500 });
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Estimation Error:", error);
    
    // Check for specific instant-fail markers
    const isPermissionError = error.message?.includes("403") || error.message?.includes("permission");
    
    return NextResponse.json(
      { 
        error: isPermissionError ? "Permission Denied: Service Account needs 'Vertex AI User' role." : error.message,
        suggestion: isPermissionError ? "Go to Google Cloud IAM and add 'Vertex AI User' to your service account." : "Try again in 2 minutes."
      }, 
      { status: isPermissionError ? 403 : 500 }
    );
  }
}