import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, r2BucketName, r2PublicUrl } from "@/lib/r2";
import { randomUUID } from "crypto";

type Params = { params: Promise<{ id: string; itemId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id, itemId } = await params;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const ext = file.type === "image/png" ? "png" : "jpg";
    const key = `inspections/${id}/${itemId}/${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await r2.send(new PutObjectCommand({
      Bucket:      r2BucketName,
      Key:         key,
      Body:        buffer,
      ContentType: file.type,
    }));

    const url = `${r2PublicUrl}/${key}`;
    return NextResponse.json({ url, storageKey: key });
  } catch (err) {
    console.error("R2 upload error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
