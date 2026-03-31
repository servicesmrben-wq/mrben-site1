import { google } from "googleapis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { 
      name, email, phone, referenceId, service, 
      qExt, tExt, qInOut, tInOut,
      hourlyRate, markup 
    } = await req.json();

    const clientEmail = process.env.DRIVE_CLIENT_EMAIL;
    const rawKey = process.env.DRIVE_PRIVATE_KEY || "";
    const privateKey = rawKey.replace(/\\n/g, "\n");
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

    // --- SUBFOLDER LOGIC ---
    let targetFolderId = folderId;
    if (referenceId && referenceId.startsWith("EST-")) {
      try {
        const searchRes = await drive.files.list({
          q: `name = '${referenceId}' and '${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          fields: "files(id)",
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });

        if (searchRes.data.files && searchRes.data.files.length > 0) {
          targetFolderId = searchRes.data.files[0].id!;
        }
      } catch (err) {
        console.error("Error finding subfolder for lead:", err);
      }
    }
    // ---------------------------

    const content = `LEAD CAPTURE
Reference ID: ${referenceId}
Date: ${new Date().toLocaleString()}

User Selected: ${service || "N/A"}

AI ESTIMATES:
1. Inside & Out:  $${qInOut || "N/A"} (${tInOut || "N/A"})
2. Exterior Only: $${qExt || "N/A"} (${tExt || "N/A"})

Internal Metrics:
Métrique: ${hourlyRate || "N/A"}$/heure
Marge: +${markup || "N/A"}

Name: ${name}
Email: ${email}
Phone: ${phone}
`;

    const fileMetadata = {
      name: `${referenceId}_Lead_${name.replace(/\s+/g, "_")}.txt`,
      parents: [targetFolderId],
    };

    const media = {
      mimeType: "text/plain",
      body: content,
    };

    await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
      supportsAllDrives: true,
      supportsTeamDrives: true,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Lead save error:", error);
    return NextResponse.json({ success: true, error: "Silent failure" }, { status: 200 }); 
  }
}
