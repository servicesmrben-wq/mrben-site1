import { NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";

export const maxDuration = 60; 
export const runtime = "nodejs";

// WARM-UP HANDLER
export async function GET() {
  return NextResponse.json({ status: "Server is awake and ready." }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate using your MrBen Service Account (with the newline fix)
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const projectId = "gen-lang-client-0569585575";

    if (!privateKey || !clientEmail) {
      return NextResponse.json({ error: "Missing Google Cloud credentials" }, { status: 500 });
    }

    const auth = new GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    // 2. Parse the uploaded files
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Convert all files to inline Base64 parts for the REST payload
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

    // 3. Prepare the VIP Vertex AI API Call (Hitting the Global Endpoint)
    const modelId = "gemini-3-flash-preview"; 
    const url = `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/global/publishers/google/models/${modelId}:generateContent`;

    const requestBody = {
      systemInstruction: {
        parts: [{ text: `You are an expert estimator. Analyze these photos to count window panes.\n\nCRITICAL VISUAL RULES:\n\nOBSTRUCTIONS & SHADOWS: Actively look behind plastic winter shelters, tanks, and into deep shadows. Do not miss partially hidden basement windows.\n\nMULLIONS: Count every distinct glass pane separated by a frame. Look closely at large window blocks: if a frame divides it, count each section (e.g., a 3-section window = 3 panes). Standard slider/hung = 2 panes.\n\nTRANSOMS: Windows above doors count separately (map to 1st floor).\n\nBASEMENT: Count 2 panes per sliding basement unit. Look closely at the foundation line.\n\nDOORS: Count each panel of sliding/entry doors as 'patio_door_panel'.\n\nSPATIAL MAPPING (Top-Down):\n\n3rd Story -> 'pane_3rd_story'\n\n2nd Story -> 'pane_2nd_story'\n\nMain/Basement -> 'pane_1st_base'\n\nOUTPUT FORMAT:\nReturn JSON ONLY. Use the 'analysis' field to briefly perform step-by-step reasoning per image to avoid missing hidden windows before outputting the final counts.\n{\n"analysis": "Img 1: Found 3 main windows (3 panes), plus 1 hidden basement slider in shadow (2 panes)...",\n"window_counts": { "pane_3rd_story": 0, "pane_2nd_story": 0, "pane_1st_base": 0, "patio_door_panel": 0 },\n"stories": 1\n}` }]
      },
      contents: [{
        role: "user",
        parts: imageParts
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.0,
      }
    };

    // Timeout logic: 58 seconds to beat Vercel's 60s limit
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 58000);

    // 4. Fire the request with the Priority Headers
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
        // --- THE VIP FAST PASS HEADERS ---
        'X-Vertex-AI-LLM-Request-Type': 'shared',
        'X-Vertex-AI-LLM-Shared-Request-Type': 'priority'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // 5. Hardened Error Catch
    const rawText = await response.text();
    if (!response.ok) {
      console.error("VERTEX API FAILED. HTTP Status:", response.status);
      console.error("RAW GOOGLE ERROR TEXT:", rawText);
      return NextResponse.json({ error: "Vertex AI rejected the request", details: rawText }, { status: response.status });
    }

    // 6. Parse the Vertex REST response and extract the text
    const data = JSON.parse(rawText);
    const aiTextResponse = data.candidates[0].content.parts[0].text;
    const cleanText = aiTextResponse.replace(/```json/gi, "").replace(/```/gi, "").trim();
    
    return NextResponse.json(JSON.parse(cleanText));

  } catch (error: any) {
    console.error("Estimation Error:", error);
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: "Request Timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}
