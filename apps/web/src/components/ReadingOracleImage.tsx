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
    const tryUrls = [imageUrl, imageFallbackUrl].filter(Boolean);
    for (const url of tryUrls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const blob = await res.blob();
        const jpgDataUrl = await blobToJpgDataUrl(blob);
        const filename = `${downloadBasename}.jpg`;

        if (typeof navigator !== "undefined" && navigator.share && typeof File !== "undefined") {
          try {
            const file = new File([blob], filename, { type: "image/jpeg" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: filename,
              });
              return;
            }
          } catch (e) {
            // fallback
          }
        }

        const a = document.createElement("a");
        a.href = jpgDataUrl;
        a.download = filename;
        a.click();
        return;
      } catch {
        /* try next */
      }
    }
  }

  async function openFullImage() {
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
