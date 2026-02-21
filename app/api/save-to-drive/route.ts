import { google } from "googleapis";
import { NextResponse } from "next/server";
import { Readable } from "stream";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const clientEmail = process.env.DRIVE_CLIENT_EMAIL;
    // Fix: Use string replace for newline handling to avoid regex parsing issues
    const rawKey = process.env.DRIVE_PRIVATE_KEY || "";
    const privateKey = rawKey.split(String.raw`\n`).join("\n"); 
    const folderId = process.env.DRIVE_FOLDER_ID;

    if (!clientEmail || !privateKey || !folderId) {
      console.error("Missing Google Drive credentials.");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });
    const formData = await req.formData();

    // 1. Handle Metadata (Estimate Breakdown)
    const metadata = formData.get("metadata");
    if (metadata && typeof metadata === "string") {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileMetadata = {
        name: `Estimate_${timestamp}.json`,
        parents: [folderId],
      };
      const media = {
        mimeType: "application/json",
        body: metadata,
      };
      
      try {
        await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: "id",
        });
      } catch (e) {
        console.error("Failed to upload metadata to Drive:", e);
      }
    }

    // 2. Handle Images
    const files = formData.getAll("files") as File[];
    const uploadPromises = files.map(async (file, index) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      const fileMetadata = {
        name: file.name,
        parents: [folderId],
      };
      const media = {
        mimeType: file.type,
        body: stream,
      };

      return drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id",
      });
    });

    await Promise.allSettled(uploadPromises);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Drive upload error:", error);
    return NextResponse.json({ success: false, error: "Silent failure" }, { status: 200 }); 
  }
}
