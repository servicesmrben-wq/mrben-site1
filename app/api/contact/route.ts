import nodemailer from "nodemailer";

export const runtime = "nodejs";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
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
    const smtpPass = process.env.SMTP_PASS?.trim();
    const contactTo =
      process.env.CONTACT_FORM_TO_EMAIL ||
      process.env.CONTACT_TO_EMAIL ||
      process.env.CONTACT_TO ||
      DEFAULT_TO;
    const contactFrom =
      process.env.CONTACT_FROM || process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM;
    const trimmedContactTo = contactTo?.trim();
    const trimmedContactFrom = contactFrom?.trim();

    if (!smtpUser || !smtpPass || !trimmedContactTo || !trimmedContactFrom) {
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
      "MESSAGE :",
      safeMessage,
    ];
    const htmlLines = [
      `<p><strong>NOM :</strong> ${escapeHtml(name)}</p>`,
      `<p><strong>COURRIEL :</strong> ${escapeHtml(email)}</p>`,
      `<p><strong>TÉLÉPHONE :</strong> ${escapeHtml(phoneLabel)}</p>`,
      `<p><strong>ADRESSE :</strong> ${escapeHtml(addressLabel)}</p>`,
      `<p><strong>SERVICES :</strong> ${escapeHtml(servicesLabel)}</p>`,
      `<p><strong>MESSAGE :</strong><br />${escapeHtml(safeMessage).replace(/\n/g, "<br />")}</p>`,
    ];

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

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
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
