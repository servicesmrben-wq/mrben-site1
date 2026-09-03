import { google } from "googleapis";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const DEFAULT_FROM = "MrBen.ca <no-reply@mrben.ca>";
const DEFAULT_TO = "info@mrben.ca";

function isImage(file: File) {
  if (file.type && file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|heic|heif|avif|bmp|tiff?)$/i.test(file.name);
}

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
    const week = normalizeSingleLine(formData.get("week"));
    const message = normalizeMultiLine(formData.get("message"));
    const honeypot = normalizeSingleLine(formData.get("company"));
    const contactRef = normalizeSingleLine(formData.get("contactRef"));
    const campaign = normalizeSingleLine(formData.get("campaign"));
    const region = normalizeSingleLine(formData.get("region"));

    // Check if images were uploaded
    const hasImages = formData.get("hasImages") === "true";

    // Estimate Data
    const estimateRef = normalizeSingleLine(formData.get("estimateRef"));
    const estimateQuote = normalizeSingleLine(formData.get("estimateQuote"));
    const estimatePanes = normalizeSingleLine(formData.get("estimatePanes"));
    const estimateTime = normalizeSingleLine(formData.get("estimateTime"));
    const estimateConf = normalizeSingleLine(formData.get("estimateConf"));
    const estimateVibe = normalizeSingleLine(formData.get("estimateVibe"));
    const estimateImgCount = normalizeSingleLine(formData.get("estimateImgCount"));
    const estimateAvgVibe = normalizeSingleLine(formData.get("estimateAvgVibe"));
    const estimateAnalysisPanes = normalizeMultiLine(formData.get("estimateAnalysisPanes"));
    const estimateAnalysisVibe = normalizeMultiLine(formData.get("estimateAnalysisVibe"));
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

    let subject = `Nouvelle demande ${region} — ${name}`;
    if (campaign === "Spring 2026 VIP") {
      subject = `Campagne courriel printemps 2026 - ${name}`;
    }

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

    if (week) {
      textLines.push(`PÉRIODE SOUHAITÉE : ${week}`);
    }

    textLines.push("");
    textLines.push("MESSAGE :");
    textLines.push(safeMessage);

    textLines.push("");
    // Only show Drive link if images were actually uploaded
    if (hasImages && contactRef) {
      const driveSearchUrl = `https://drive.google.com/drive/search?q=${contactRef}`;
      textLines.push("PHOTOS (GOOGLE DRIVE) :");
      textLines.push(driveSearchUrl);
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
      textLines.push(`Nombre d'images analysées : ${estimateImgCount}`);
      textLines.push(`VIBE (Difficulté moyenne) : ${estimateVibe} (Multiplier: ${estimateAvgVibe})`);
      textLines.push(`Métrique : ${hourlyRate}$/heure | Marge : +${markup} | Frais de service et déplacement : ${serviceFee}$`);
      textLines.push("");
      textLines.push(`OPTION 1 : Intérieur et Extérieur`);
      textLines.push(`Prix : $${qInOut} | Temps : ${tInOut}`);
      textLines.push("");
      textLines.push(`OPTION 2 : Extérieur Seulement`);
      textLines.push(`Prix : $${qExt} | Temps : ${tExt}`);
      textLines.push("");
      textLines.push(`Détails des panneaux comptés : ${estimateDetails}`);
      textLines.push("");
      textLines.push("ANALYSE DÉTAILLÉE PAR IMAGE (PANNEAUX) :");
      textLines.push(estimateAnalysisPanes || "N/A");
      textLines.push("");
      textLines.push("ANALYSE ARCHITECTURALE (VIBE) :");
      textLines.push(estimateAnalysisVibe || "N/A");
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

    if (week) {
      htmlLines.push(`<p><strong>PÉRIODE SOUHAITÉE :</strong> ${escapeHtml(week)}</p>`);
    }

    htmlLines.push(`<p><strong>MESSAGE :</strong><br />${escapeHtml(safeMessage).replace(/\n/g, "<br />")}</p>`);

    // Only show Drive link if images were actually uploaded
    if (hasImages && contactRef) {
      const driveSearchUrl = `https://drive.google.com/drive/search?q=${contactRef}`;
      htmlLines.push(`<p><strong>PHOTOS (GOOGLE DRIVE) :</strong> <br /><a href="${driveSearchUrl}">${driveSearchUrl}</a></p>`);
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
          <p style="margin: 5px 0;"><strong>Nombre d'images analysées :</strong> ${escapeHtml(estimateImgCount)}</p>
          <p style="margin: 5px 0;"><strong>VIBE (Difficulté moyenne) :</strong> ${escapeHtml(estimateVibe)} (Multiplier: ${escapeHtml(estimateAvgVibe)})</p>
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

          <p style="margin: 15px 0 0 0; font-size: 0.85em; color: #64748b; border-top: 1px solid #dcfce7; padding-top: 10px;">
            <strong>Détails des panneaux comptés :</strong> ${escapeHtml(estimateDetails)}
          </p>

          <div style="margin-top: 15px; font-size: 0.85em; color: #64748b;">
            <strong style="display: block; margin-bottom: 5px;">ANALYSE DÉTAILLÉE PAR IMAGE (PANNEAUX) :</strong>
            <pre style="white-space: pre-wrap; font-family: inherit; background: #f8fafc; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0; margin: 0;">${escapeHtml(estimateAnalysisPanes)}</pre>
          </div>

          <div style="margin-top: 15px; font-size: 0.85em; color: #64748b;">
            <strong style="display: block; margin-bottom: 5px;">ANALYSE ARCHITECTURALE (VIBE) :</strong>
            <pre style="white-space: pre-wrap; font-family: inherit; background: #f8fafc; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0; margin: 0;">${escapeHtml(estimateAnalysisVibe)}</pre>
          </div>
        </div>
      `);
    }

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
