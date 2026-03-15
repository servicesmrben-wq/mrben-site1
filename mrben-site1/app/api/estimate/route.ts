import { NextResponse } from "next/server";

export const runtime = "nodejs";

// The URL of your newly deployed Cloud Run Microservice
const CLOUD_RUN_API_URL = "https://mrben-estimator-api-529910920022.us-east1.run.app/estimate";

// WARM-UP HANDLER (Optional but keeps your Cloud Run service "hot")
export async function GET() {
  try {
    const res = await fetch(CLOUD_RUN_API_URL.replace("/estimate", "/"), { method: 'GET' });
    return NextResponse.json({ status: "Frontend and Backend are connected." }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ status: "Backend unreachable" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Get the FormData from the user's browser
    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // 2. Prepare the hand-off to your Cloud Run API
    // We recreate the FormData to ensure a clean transmission
    const backendFormData = new FormData();
    files.forEach((file) => {
      backendFormData.append("files", file);
    });

    // 3. Forward the request to Cloud Run
    // We don't need 'Authorization' headers anymore because we set 'allUsers' as 'run.invoker'
    const response = await fetch(CLOUD_RUN_API_URL, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloud Run API Error:", errorText);
      return NextResponse.json(
        { error: "The AI Estimator is temporarily unavailable.", details: errorText },
        { status: response.status }
      );
    }

    // 4. Return the AI's window counts directly to your frontend
    const aiResult = await response.json();
    return NextResponse.json(aiResult);

  } catch (error: any) {
    console.error("Next.js Route Error:", error);
    
    return NextResponse.json({ error: "Failed to connect to estimator service." }, { status: 500 });
  }
}