import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ ok: true });

    const publicBase = process.env.R2_PUBLIC_URL;
    const key = url.startsWith(publicBase) ? url.slice(publicBase.length + 1) : null;
    if (!key) return NextResponse.json({ ok: true });

    await client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
    }));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[r2-delete]", err);
    return NextResponse.json({ ok: true }); // non-fatal — image may already be gone
  }
}
