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

    // 2. Obtain Google Auth Access Token
    const auth = new GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: "https://www.googleapis.com/auth/cloud-platform",
    });

    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;

    if (!accessToken) {
      throw new Error("Failed to obtain Google access token");
    }

    const location = "us-central1";
    const modelName = "mrben-pane-counter-v4";
    const apiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelName}:generateContent`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            ...imageParts,
            {
              text: "Count the window panes following the Squeegee Rule."
            }
          ]
        }
      ],
      systemInstruction: {
        parts: [
          {
            text: `You are an expert window cleaning estimator. Your task is to analyze the provided images and count the total number of individual, structurally framed glass panels.

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
          }
        ]
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.0,
      },
    };

    // 3. Manual Fetch for Hardened Error Handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 58000);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 1. Extract the raw text first
    const rawText = await response.text();

    // 2. Add a safety catch: if (!response.ok)
    if (!response.ok) {
      console.error("Vertex AI API Error Status:", response.status);
      console.error("Vertex AI API Raw Text:", rawText);
      return NextResponse.json(
        { 
          error: "Vertex AI API Error", 
          status: response.status,
          details: rawText 
        }, 
        { status: 500 }
      );
    }

    // 3. Only execute JSON.parse if the response is actually successful
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.error("AI Parsing Error. Raw text was:", rawText);
      return NextResponse.json({ error: "Failed to parse estimation data.", raw: rawText }, { status: 500 });
    }

    // Extract the content from the API response structure
    const candidate = data.candidates?.[0];
    const aiResponseText = candidate?.content?.parts?.[0]?.text;

    if (!aiResponseText) {
      console.error("HARDENED CHECK: AI returned empty text structure. Raw:", rawText);
      return NextResponse.json({ 
        error: "AI returned empty response structure", 
        raw: rawText 
      }, { status: 500 });
    }

    const cleanText = aiResponseText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(cleanText);
    } catch (e) {
      console.error("AI Nested JSON Parsing Error:", aiResponseText);
      return NextResponse.json({ error: "Failed to parse nested JSON estimation data.", raw: aiResponseText }, { status: 500 });
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Estimation Error:", error);
    const message = error.name === 'AbortError' ? "Request Timeout after 58s" : (error.message || "An unexpected error occurred.");
    const status = message.includes("Timeout") ? 504 : 500;
    
    return NextResponse.json(
      { error: message },
      { status: status }
    );
  }
}
