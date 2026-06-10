import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as Sentry from "@sentry/nextjs";

let r2ClientCache: S3Client | null | undefined = undefined;

function getR2Client(): S3Client | null {
  if (r2ClientCache !== undefined) return r2ClientCache;
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    r2ClientCache = null;
    return null;
  }
  r2ClientCache = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return r2ClientCache;
}

/**
 * Uploads the final composed+watermarked image to R2 for permanent storage.
 * Accepts a data:image/... base64 URL (from finalizeReadingImages) or an https URL.
 * Returns the permanent R2 CDN URL, or null if R2 is not configured or upload fails.
 * Failure is intentionally non-fatal — caller should store whatever URL it has.
 */
export async function uploadGeneratedImageToR2(
  imageDataUrl: string,
  userId: string,
  consultationId: string,
): Promise<string | null> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!client || !bucket || !publicUrl) return null;

  try {
    let imageBuffer: Buffer;
    let contentType: string;

    if (imageDataUrl.startsWith("data:")) {
      const commaIdx = imageDataUrl.indexOf(",");
      if (commaIdx === -1) return null;
      const header = imageDataUrl.slice(5, commaIdx);
      const semiIdx = header.indexOf(";base64");
      if (semiIdx === -1) return null;
      contentType = header.slice(0, semiIdx) || "image/png";
      imageBuffer = Buffer.from(imageDataUrl.slice(commaIdx + 1), "base64");
    } else if (imageDataUrl.startsWith("http://") || imageDataUrl.startsWith("https://")) {
      const res = await fetch(imageDataUrl);
      if (!res.ok) return null;
      imageBuffer = Buffer.from(await res.arrayBuffer());
      contentType = res.headers.get("content-type") ?? "image/jpeg";
    } else {
      return null;
    }

    const ext = contentType.includes("jpeg") || contentType.includes("jpg") ? "jpeg" : "png";
    const key = `generated/${userId}/${consultationId}.${ext}`;

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: imageBuffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    return `${publicUrl.replace(/\/$/, "")}/${key}`;
  } catch (err) {
    Sentry.captureMessage("r2_upload_failed", {
      level: "warning",
      extra: { userId, consultationId, error: err instanceof Error ? err.message : String(err) },
    });
    return null;
  }
}
