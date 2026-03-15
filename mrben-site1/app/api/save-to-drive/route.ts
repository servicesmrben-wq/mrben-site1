import { google } from "googleapis";
import { NextResponse } from "next/server";
import { Readable } from "stream";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
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
    const formData = await req.formData();

    // Get Reference ID (Default to "NoRef" if missing)
    const referenceId = formData.get("referenceId")?.toString() || "NoRef";

    // --- SUBFOLDER CREATION ---
    // 1. Create or Find Subfolder for this Estimate
    let subfolderId = folderId;
    try {
      const searchRes = await drive.files.list({
        q: `name = '${referenceId}' and '${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: "files(id)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      if (searchRes.data.files && searchRes.data.files.length > 0) {
        subfolderId = searchRes.data.files[0].id!;
      } else {
        const folderMetadata = {
          name: referenceId,
          mimeType: "application/vnd.google-apps.folder",
          parents: [folderId],
        };
        const folder = await drive.files.create({
          requestBody: folderMetadata,
          fields: "id",
          supportsAllDrives: true,
        });
        subfolderId = folder.data.id!;
      }
    } catch (err) {
      console.error("Folder creation error:", err);
      // Fallback to root folder if subfolder creation fails
    }
    // ---------------------------

    // 1. Handle Metadata (Estimate Breakdown)
    const metadata = formData.get("metadata");
    if (metadata && typeof metadata === "string") {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileMetadata = {
        name: `${referenceId}_Estimate_${timestamp}.json`,
        parents: [subfolderId],
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
          supportsAllDrives: true,
          supportsTeamDrives: true,
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

      // Prepend Reference ID to filename
      const fileMetadata = {
        name: `${referenceId}_${file.name}`,
        parents: [subfolderId],
      };
      const media = {
        mimeType: file.type,
        body: stream,
      };

      return drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id",
        supportsAllDrives: true,
        supportsTeamDrives: true,
      });
    });

    await Promise.allSettled(uploadPromises);

    return NextResponse.json({ success: true, folderId: subfolderId });

  } catch (error) {
    console.error("Drive upload error:", error);
    return NextResponse.json({ success: false, error: "Silent failure" }, { status: 200 }); 
  }
}
