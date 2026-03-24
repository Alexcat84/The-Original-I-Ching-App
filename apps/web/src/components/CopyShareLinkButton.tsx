"use client";

export function CopyShareLinkButton({ url, label }: { url: string; label: string }) {
  return (
    <button
      type="button"
      className="secondary-btn"
      onClick={() => void navigator.clipboard.writeText(url)}
    >
      {label}
    </button>
  );
}
