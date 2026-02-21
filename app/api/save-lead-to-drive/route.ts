import { google } from "googleapis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { name, email, phone, referenceId } = await req.json();

    const clientEmail = process.env.DRIVE_CLIENT_EMAIL;
    const rawKey = process.env.DRIVE_PRIVATE_KEY || "";
    const privateKey = rawKey.split(String.raw`
`).join("
"); 
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

    const content = `LEAD CAPTURE
Reference ID: ${referenceId}
Date: ${new Date().toLocaleString()}

Name: ${name}
Email: ${email}
Phone: ${phone}
`;

    const fileMetadata = {
      name: `${referenceId}_Lead_${name.replace(/\s+/g, "_")}.txt`,
      parents: [folderId],
    };

    const media = {
      mimeType: "text/plain",
      body: content,
    };

    await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
      supportsAllDrives: true, // Required for Shared Drives
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Lead save error:", error);
    // Return true anyway so the user sees success (we can log the failure internally)
    return NextResponse.json({ success: true, error: "Silent failure" }, { status: 200 }); 
  }
}
