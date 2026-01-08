import { Resend } from "resend";

export const runtime = "nodejs"; // Resend requires Node runtime (not Edge)

type Payload = {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  services?: string[];
  message?: string;
};

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

    const body = (await req.json()) as Payload;

    const name = (body.name || "").trim();
    const phone = (body.phone || "").trim();
    const email = (body.email || "").trim();
    const address = (body.address || "").trim();
    const services = Array.isArray(body.services) ? body.services : [];
    const message = (body.message || "").trim();

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
      "",
      "Message:",
      message || "(no message)",
    ];

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: TO,
      // reply_to makes "Reply" go to the customer
      replyTo: email,
      subject,
      text: textLines.join("\n"),
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
