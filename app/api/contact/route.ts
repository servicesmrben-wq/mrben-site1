import { google } from "googleapis";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const MAX_IMAGES = 5;
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
    const textLines = [
      `NOM : ${name}`,
      `COURRIEL : ${email}`,
      `TÉLÉPHONE : ${phoneLabel}`,
      `ADRESSE : ${addressLabel}`,
      `SERVICES : ${servicesLabel}`,
      "",
      imageUrls.length > 0 ? "PHOTOS (LIENS) :" : "",
      ...imageUrls,
      "",
      "MESSAGE :",
      safeMessage,
    ];
    const htmlLines = [
      `<p><strong>NOM :</strong> ${escapeHtml(name)}</p>`,
      `<p><strong>COURRIEL :</strong> ${escapeHtml(email)}</p>`,
      `<p><strong>TÉLÉPHONE :</strong> ${escapeHtml(phoneLabel)}</p>`,
      `<p><strong>ADRESSE :</strong> ${escapeHtml(addressLabel)}</p>`,
      `<p><strong>SERVICES :</strong> ${escapeHtml(servicesLabel)}</p>`,
    ];

    if (imageUrls.length > 0) {
      htmlLines.push(`<p><strong>PHOTOS (LIENS) :</strong></p><ul>`);
      imageUrls.forEach((url) => {
        htmlLines.push(`<li><a href="${url}">${url}</a></li>`);
      });
      htmlLines.push(`</ul>`);
    }

    htmlLines.push(`<p><strong>MESSAGE :</strong><br />${escapeHtml(safeMessage).replace(/\n/g, "<br />")}</p>`);

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
