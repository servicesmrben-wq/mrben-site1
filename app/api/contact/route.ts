import { Resend } from "resend";

export const runtime = "nodejs"; // Resend requires Node runtime (not Edge)

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const TO = process.env.CONTACT_TO_EMAIL;
    const FROM = process.env.CONTACT_FROM_EMAIL;

    if (!RESEND_API_KEY || !TO || !FROM) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Server configuration missing environment variables.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const formData = await req.formData();

    const name = (formData.get("name")?.toString() || "").trim();
    const phone = (formData.get("phone")?.toString() || "").trim();
    const email = (formData.get("email")?.toString() || "").trim();
    const address = (formData.get("address")?.toString() || "").trim();
    const servicesRaw = formData.get("services")?.toString() || "[]";
    const message = (formData.get("message")?.toString() || "").trim();

    let services: string[] = [];
    try {
      const parsed = JSON.parse(servicesRaw);
      services = Array.isArray(parsed) ? parsed : [];
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

    const resend = new Resend(RESEND_API_KEY);

    const subject = `New contact request — ${name}`;

    const textLines = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : `Phone: (not provided)`,
      address ? `Address: ${address}` : `Address: (not provided)`,
      `Services: ${services.length ? services.join(", ") : "(none selected)"}`,
      files.length ? `Images attached: ${files.length}` : "",
      "",
      "Message:",
      message || "(no message)",
    ];

    const attachments = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return {
          filename: file.name || "attachment",
          content: buffer.toString("base64"),
          contentType: file.type || "application/octet-stream",
        };
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: TO,
      // reply_to makes "Reply" go to the customer
      replyTo: email,
      subject,
      text: textLines.filter(Boolean).join("\n"),
      attachments: attachments.length ? attachments : undefined,
    });

    if (error) {
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid request." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
