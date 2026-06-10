"use client";

type Props = {
  imageUrl: string;
  imageFallbackUrl: string;
  downloadBasename: string;
  downloadLabel?: string;
  openLabel?: string;
  imageAlt?: string;
};

export function ReadingOracleImage({
  imageUrl,
  imageFallbackUrl,
  downloadBasename,
  downloadLabel = "Descargar imagen",
  openLabel = "Abrir imagen en tamaño completo",
  imageAlt = "Representación simbólica del trazado",
}: Props) {
  async function resolveImageObjectUrl(): Promise<string | null> {
    const tryUrls = [imageUrl, imageFallbackUrl].filter(Boolean);
    for (const url of tryUrls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      } catch {
        /* try next */
      }
    }
    return null;
  }

  async function blobToJpgDataUrl(blob: Blob): Promise<string> {
    const objectUrl = URL.createObjectURL(blob);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("img_decode_failed"));
        el.src = objectUrl;
      });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, img.naturalWidth || img.width);
      canvas.height = Math.max(1, img.naturalHeight || img.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas_ctx_unavailable");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL("image/jpeg", 0.92);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function download() {
    // For https URLs (R2, CDN): proxy through server to avoid CORS and trigger download
    const tryUrls = [imageUrl, imageFallbackUrl].filter(Boolean);
    for (const url of tryUrls) {
      try {
        if (url.startsWith("https://") || url.startsWith("http://")) {
          const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
          const res = await fetch(proxyUrl);
          if (!res.ok) continue;
          const blob = await res.blob();
          const jpgDataUrl = await blobToJpgDataUrl(blob);
          const a = document.createElement("a");
          a.href = jpgDataUrl;
          a.download = `${downloadBasename}.jpg`;
          a.click();
          return;
        }
        // data: URLs — fetch directly (no CORS restriction)
        const res = await fetch(url);
        if (!res.ok) continue;
        const blob = await res.blob();
        const jpgDataUrl = await blobToJpgDataUrl(blob);
        const a = document.createElement("a");
        a.href = jpgDataUrl;
        a.download = `${downloadBasename}.jpg`;
        a.click();
        return;
      } catch {
        /* try next */
      }
    }
  }

  async function openFullImage() {
    // For https URLs (R2, CDN): open directly — no CORS fetch needed
    if (imageUrl.startsWith("https://") || imageUrl.startsWith("http://")) {
      window.open(imageUrl, "_blank", "noopener,noreferrer");
      return;
    }
    // For data: URLs: create a blob URL for clean tab rendering
    const objectUrl = await resolveImageObjectUrl();
    if (objectUrl) {
      window.open(objectUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      return;
    }
    window.open(imageUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="reading-visual-pane">
      <button
        type="button"
        className="reading-visual-zoom-link"
        onClick={() => void openFullImage()}
        aria-label={openLabel}
      >
        <img
          src={imageUrl}
          alt={imageAlt}
          className="oracle-image reading-visual-thumb"
          data-testid="consultation-image"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== imageFallbackUrl) {
              target.src = imageFallbackUrl;
            }
          }}
        />
      </button>
      <div className="reading-visual-actions">
        <button type="button" className="secondary-btn reading-visual-action-btn" onClick={() => void download()}>
          {downloadLabel}
        </button>
      </div>
    </div>
  );
}
