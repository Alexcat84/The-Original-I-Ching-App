import * as FileSystem from "expo-file-system";
import { getPendingImages, setLocalImagePath, markImageError } from "../db/chat-store";

const IMAGE_DIR = `${FileSystem.documentDirectory}iching_images/`;

async function ensureImageDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(IMAGE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
  }
}

function imageFilename(url: string): string {
  let h = 2166136261;
  for (let i = 0; i < url.length; i++) {
    h ^= url.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hash = (h >>> 0).toString(16).padStart(8, "0");
  const ext = url.split("?")[0]?.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = /^[a-z0-9]{1,5}$/.test(ext) ? ext : "jpg";
  return `${hash}.${safeExt}`;
}

export function computeLocalImagePath(imageUrl: string): string {
  return `${IMAGE_DIR}${imageFilename(imageUrl)}`;
}

async function downloadOne(
  messageId: string,
  imageUrl: string,
): Promise<void> {
  const localPath = computeLocalImagePath(imageUrl);
  const info = await FileSystem.getInfoAsync(localPath);
  if (info.exists) {
    await setLocalImagePath(messageId, localPath);
    return;
  }
  const result = await FileSystem.downloadAsync(imageUrl, localPath);
  if (result.status >= 200 && result.status < 300) {
    await setLocalImagePath(messageId, localPath);
  } else {
    await markImageError(messageId);
    await FileSystem.deleteAsync(localPath, { idempotent: true });
  }
}

/** Downloads up to `batchSize` pending images. Fire-and-forget safe. */
export async function syncPendingImages(batchSize = 10): Promise<void> {
  try {
    await ensureImageDir();
    const pending = await getPendingImages(batchSize);
    for (const row of pending) {
      try {
        await downloadOne(row.id, row.image_url);
      } catch {
        await markImageError(row.id).catch(() => undefined);
      }
    }
  } catch {
    // Non-fatal — image cache is opportunistic
  }
}
