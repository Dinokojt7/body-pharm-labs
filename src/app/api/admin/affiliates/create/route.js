import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { isAdmin } from "@/lib/utils/admin";

function buildTransporter() {
  const port = Number(process.env.SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    family: 4,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendInviteEmail(email, name, resetLink) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { sent: false };
  }
  try {
    const transporter = buildTransporter();
    await transporter.sendMail({
      from: `"Body Pharm Labs" <${process.env.EMAIL_FROM || "info@bodypharmlabs.com"}>`,
      to: email,
      subject: "You've been added as an affiliate — Body Pharm Labs",
      html: `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tr><td style="background:#000;padding:32px;text-align:center;">
          <p style="margin:0 0 6px;color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:0.22em;text-transform:uppercase;">Body Pharm Labs</p>
          <p style="margin:0;color:#fff;font-size:20px;font-weight:700;">Welcome, ${name}</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 20px;color:#6b7280;font-size:13px;line-height:1.6;">
            You've been set up as an affiliate. Set your password to log in and track your sales.
          </p>
          <div style="text-align:center;">
            <a href="${resetLink}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:12px 28px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
              Set Your Password
            </a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
    });
    return { sent: true };
  } catch (err) {
    console.error("[affiliates/create] email send failed:", err);
    return { sent: false };
  }
}

export async function POST(request) {
  let createdUid = null;
  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();

  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ success: false, error: "Service unavailable" }, { status: 503 });
    }

    const { idToken, name, email, discountCode } = await request.json();
    if (!idToken) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    if (!isAdmin(decoded.uid)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const trimmedName = (name || "").trim();
    const trimmedEmail = (email || "").toLowerCase().trim();
    const code = (discountCode || "").toUpperCase().trim();

    if (!trimmedName || !trimmedEmail || !code) {
      return NextResponse.json({ success: false, error: "Name, email, and discount code are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json({ success: false, error: "Enter a valid email address." }, { status: 400 });
    }

    const discountSnap = await adminDb.collection("discounts").where("code", "==", code).limit(1).get();
    if (discountSnap.empty) {
      return NextResponse.json({ success: false, error: "That discount code doesn't exist." }, { status: 400 });
    }

    const existingAffiliateSnap = await adminDb.collection("affiliates").where("discountCode", "==", code).limit(1).get();
    if (!existingAffiliateSnap.empty) {
      return NextResponse.json({ success: false, error: "This code is already linked to another affiliate." }, { status: 409 });
    }

    let userRecord;
    try {
      userRecord = await adminAuth.createUser({ email: trimmedEmail, displayName: trimmedName });
    } catch (err) {
      if (err.code === "auth/email-already-exists") {
        return NextResponse.json({ success: false, error: "An account with this email already exists." }, { status: 409 });
      }
      throw err;
    }
    createdUid = userRecord.uid;

    const { Timestamp } = await import("firebase-admin/firestore");
    await adminDb.collection("affiliates").doc(createdUid).set({
      name: trimmedName,
      email: trimmedEmail,
      discountCode: code,
      active: true,
      createdAt: Timestamp.now(),
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bodypharmlabs.com";
    const resetLink = await adminAuth.generatePasswordResetLink(trimmedEmail, {
      url: `${siteUrl}/affiliate/login`,
    });

    const { sent } = await sendInviteEmail(trimmedEmail, trimmedName, resetLink);

    return NextResponse.json({
      success: true,
      affiliateId: createdUid,
      emailSent: sent,
      resetLink: sent ? undefined : resetLink,
    });
  } catch (error) {
    console.error("[affiliates/create]", error);
    // Roll back BOTH the Auth user and the Firestore doc, whichever exist —
    // a partial failure here (e.g. the reset-link step throwing after the
    // Firestore write already succeeded) would otherwise leave an orphaned
    // affiliate doc permanently squatting on the discount code with no
    // matching login, since the code-uniqueness check treats the doc as
    // claimed regardless of whether the Auth account is still there.
    if (createdUid) {
      if (adminDb) {
        try {
          await adminDb.collection("affiliates").doc(createdUid).delete();
        } catch (rollbackErr) {
          console.error("[affiliates/create] doc rollback failed:", rollbackErr);
        }
      }
      if (adminAuth) {
        try {
          await adminAuth.deleteUser(createdUid);
        } catch (rollbackErr) {
          console.error("[affiliates/create] user rollback failed:", rollbackErr);
        }
      }
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
