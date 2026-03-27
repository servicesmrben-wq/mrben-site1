import { google } from "googleapis";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DEFAULT_FROM = "MrBen.ca <no-reply@mrben.ca>";
const DEFAULT_TO = "info@mrben.ca";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeSingleLine(value: FormDataEntryValue | null) {
  return (value?.toString() || "").replace(/\0/g, "").replace(/[\r\n]+/g, " ").trim();
}

function normalizeMultiLine(value: FormDataEntryValue | null) {
  return (value?.toString() || "").replace(/\0/g, "").replace(/\r\n/g, "\n").trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  try {
    const smtpUser = process.env.SMTP_USER?.trim();
    const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    const googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();
    const contactTo =
      process.env.CONTACT_FORM_TO_EMAIL ||
      process.env.CONTACT_TO_EMAIL ||
      process.env.CONTACT_TO ||
      DEFAULT_TO;
    const contactFrom =
      process.env.CONTACT_FROM || process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM;
    const trimmedContactTo = contactTo?.trim();
    const trimmedContactFrom = contactFrom?.trim();

    if (
      !smtpUser ||
      !googleClientId ||
      !googleClientSecret ||
      !googleRefreshToken ||
      !trimmedContactTo ||
      !trimmedContactFrom
    ) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Server configuration is missing required email settings.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const formData = await req.formData();

    const name = normalizeSingleLine(formData.get("name"));
    const phone = normalizeSingleLine(formData.get("phone"));
    const email = normalizeSingleLine(formData.get("email"));
    const address = normalizeSingleLine(formData.get("address"));
    const servicesRaw = formData.get("services")?.toString() || "[]";
    const imageUrlsRaw = formData.get("imageUrls")?.toString() || "[]";
    const message = normalizeMultiLine(formData.get("message"));
    const honeypot = normalizeSingleLine(formData.get("company"));

    // Estimate Data
    const estimateRef = normalizeSingleLine(formData.get("estimateRef"));
    const estimateQuote = normalizeSingleLine(formData.get("estimateQuote"));
    const estimatePanes = normalizeSingleLine(formData.get("estimatePanes"));
    const estimateTime = normalizeSingleLine(formData.get("estimateTime"));
    const estimateConf = normalizeSingleLine(formData.get("estimateConf"));
    const estimateDetails = normalizeSingleLine(formData.get("estimateDetails"));

    // Extended comparison
    const qExt = normalizeSingleLine(formData.get("qExt"));
    const tExt = normalizeSingleLine(formData.get("tExt"));
    const qInOut = normalizeSingleLine(formData.get("qInOut"));
    const tInOut = normalizeSingleLine(formData.get("tInOut"));
    const selectedService = normalizeSingleLine(formData.get("selectedService"));

    // Pricing metrics
    const hourlyRate = normalizeSingleLine(formData.get("hourlyRate"));
    const markup = normalizeSingleLine(formData.get("markup"));
    const serviceFee = normalizeSingleLine(formData.get("serviceFee"));

    if (honeypot) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid submission." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let services: string[] = [];
    try {
      const parsed = JSON.parse(servicesRaw);
      services = Array.isArray(parsed)
        ? parsed.map((service) => normalizeSingleLine(String(service))).filter(Boolean)
        : [];
    } catch {
      services = [];
    }

    let imageUrls: string[] = [];
    try {
      const parsed = JSON.parse(imageUrlsRaw);
      imageUrls = Array.isArray(parsed) ? parsed.filter((u) => typeof u === "string") : [];
    } catch {
      imageUrls = [];
    }

    const files = formData
      .getAll("images")
      .filter((item): item is File => item instanceof File);

    if (files.length > MAX_IMAGES) {
      return new Response(JSON.stringify({ ok: false, error: "Too many images." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (files.some((file) => !ALLOWED_IMAGE_TYPES.includes(file.type))) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid image type." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (files.some((file) => file.size > MAX_IMAGE_SIZE)) {
      return new Response(JSON.stringify({ ok: false, error: "Image exceeds size limit." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!name) {
      return new Response(JSON.stringify({ ok: false, error: "Name is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!email || !isEmail(email)) {
      return new Response(JSON.stringify({ ok: false, error: "Valid email is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const subject = `Nouvelle demande de contact — ${name}`;

    const safeMessage = message || "(no message)";
    const servicesLabel = services.length ? services.join(", ") : "(none selected)";
    const phoneLabel = phone ? phone : "(not provided)";
    const addressLabel = address ? address : "(not provided)";
    
    // Construct Text Body
    const textLines = [
      `NOM : ${name}`,
      `COURRIEL : ${email}`,
      `TÉLÉPHONE : ${phoneLabel}`,
      `ADRESSE : ${addressLabel}`,
      `SERVICES : ${servicesLabel}`
    ];

    textLines.push("");
    textLines.push("MESSAGE :");
    textLines.push(safeMessage);

    textLines.push("");
    if (imageUrls.length > 0) {
      textLines.push("PHOTOS (LIENS) :");
      textLines.push(...imageUrls);
      textLines.push("");
    }

    if (estimateQuote) {
      const displayService = selectedService === "Exterior Only" ? "Extérieur Seulement" : "Intérieur et Extérieur";
      const driveSearchUrl = `https://drive.google.com/drive/search?q=${estimateRef}`;
      
      textLines.push("");
      textLines.push("--- RÉSUMÉ DE L'ESTIMATION IA ---");
      textLines.push(`RÉF ID : ${estimateRef}`);
      textLines.push(`LIEN DRIVE : ${driveSearchUrl} (<-Cliquez ici, GoogleDrive Photos Client)`);
      textLines.push(`SÉLECTION DE L'UTILISATEUR : ${displayService}`);
      textLines.push(`Nombre total de panneaux vitrés : ${estimatePanes}`);
      textLines.push(`Métrique : ${hourlyRate}$/heure | Marge : +${markup} | Frais de service et déplacement : ${serviceFee}$`);
      textLines.push("");
      textLines.push(`OPTION 1 : Intérieur et Extérieur`);
      textLines.push(`Prix : $${qInOut} | Temps : ${tInOut}`);
      textLines.push("");
      textLines.push(`OPTION 2 : Extérieur Seulement`);
      textLines.push(`Prix : $${qExt} | Temps : ${tExt}`);
      textLines.push("");
      textLines.push(`Détails des panneaux comptés : ${estimateDetails}`);
      textLines.push("---------------------------");
    }

    // Construct HTML Body
    const htmlLines = [
      `<p><strong>NOM :</strong> ${escapeHtml(name)}</p>`,
      `<p><strong>COURRIEL :</strong> ${escapeHtml(email)}</p>`,
      `<p><strong>TÉLÉPHONE :</strong> ${escapeHtml(phoneLabel)}</p>`,
      `<p><strong>ADRESSE :</strong> ${escapeHtml(addressLabel)}</p>`,
      `<p><strong>SERVICES :</strong> ${escapeHtml(servicesLabel)}</p>`,
    ];

    htmlLines.push(`<p><strong>MESSAGE :</strong><br />${escapeHtml(safeMessage).replace(/\n/g, "<br />")}</p>`);

    if (imageUrls.length > 0) {
      htmlLines.push(`<p><strong>PHOTOS (LIENS) :</strong></p><ul>`);
      imageUrls.forEach((url) => {
        htmlLines.push(`<li><a href="${url}">${url}</a></li>`);
      });
      htmlLines.push(`</ul>`);
    }

    if (estimateQuote) {
      const displayService = selectedService === "Exterior Only" ? "Extérieur Seulement" : "Intérieur et Extérieur";
      const driveSearchUrl = `https://drive.google.com/drive/search?q=${estimateRef}`;

      htmlLines.push(`
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 15px 0; font-family: sans-serif;">
          <h3 style="margin: 0 0 10px 0; color: #166534;">Résumé de l'estimation IA</h3>
          <p style="margin: 5px 0;"><strong>Réf ID :</strong> <a href="${driveSearchUrl}" style="color: #166534; font-weight: bold; text-decoration: underline;">${escapeHtml(estimateRef)}</a> (<-Cliquez ici, GoogleDrive Photos Client)</p>
          <p style="margin: 5px 0;"><strong>Sélection de l'utilisateur :</strong> <span style="background: #dcfce7; padding: 2px 6px; border-radius: 4px;">${escapeHtml(displayService)}</span></p>
          <p style="margin: 5px 0;"><strong>Nombre total de panneaux vitrés :</strong> ${escapeHtml(estimatePanes)}</p>
          <p style="margin: 5px 0; font-size: 0.85em; color: #64748b;"><strong>Métrique :</strong> ${escapeHtml(hourlyRate)}$/heure | <strong>Marge :</strong> +${escapeHtml(markup)} | <strong>Frais de service et déplacement :</strong> ${escapeHtml(serviceFee)}$</p>
          
          <div style="margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <div style="font-weight: bold; font-size: 0.8em; color: #64748b; text-transform: uppercase;">Intérieur et Extérieur</div>
              <div style="font-size: 1.2em; font-weight: bold; color: #0f172a;">$${escapeHtml(qInOut)}</div>
              <div style="font-size: 0.85em; color: #64748b;">Temps : ${escapeHtml(tInOut)}</div>
            </div>
            <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <div style="font-weight: bold; font-size: 0.8em; color: #64748b; text-transform: uppercase;">Extérieur Seulement</div>
              <div style="font-size: 1.2em; font-weight: bold; color: #0f172a;">$${escapeHtml(qExt)}</div>
              <div style="font-size: 0.85em; color: #64748b;">Temps : ${escapeHtml(tExt)}</div>
            </div>
          </div>

          <p style="margin: 15px 0 0 0; font-size: 0.85em; color: #64748b; border-top: 1px solid #dcfce7; pt-10px;">
            <strong>Détails des panneaux comptés :</strong> ${escapeHtml(estimateDetails)}
          </p>
        </div>
      `);
    }

    const attachments = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return {
          filename: file.name || "attachment",
          content: buffer,
          contentType: file.type || "application/octet-stream",
        };
      })
    );

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: smtpUser,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken.token as string,
      },
    });

    await transporter.sendMail({
      from: trimmedContactFrom,
      to: trimmedContactTo,
      replyTo: email,
      subject,
      text: textLines.filter(Boolean).join("\n"),
      html: htmlLines.join("\n"),
      attachments: attachments.length ? attachments : undefined,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Contact form email failed:", err);
    return new Response(JSON.stringify({ ok: false, error: "Email send failed." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
