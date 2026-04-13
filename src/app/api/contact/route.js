import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const port = Number(process.env.SMTP_PORT) || 587;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      family: 4,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Body Pharm Labz" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;border:1px solid #f3f4f6;border-radius:8px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 24px;">New Contact Enquiry</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;width:120px;">Name</td>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111;font-weight:600;">${name}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;">Email</td>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111;font-weight:600;">${email}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;">Subject</td>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111;font-weight:600;">${subject}</td>
            </tr>
          </table>
          <div style="background:#f9fafb;border-radius:6px;padding:16px;">
            <p style="font-size:13px;color:#6b7280;margin:0 0 8px;">Message</p>
            <p style="font-size:14px;color:#111;margin:0;white-space:pre-wrap;">${message}</p>
          </div>
          <p style="font-size:11px;color:#9ca3af;margin:24px 0 0;">Reply directly to this email to respond to ${name}.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
