export function consultationPublicPath(publicId: string): string {
  return `/r/${publicId}`;
}

export function sessionPublicPath(publicId: string): string {
  return `/s/${publicId}`;
}

export function sharingUtm(
  path: string,
  medium: "whatsapp" | "x" | "facebook" | "telegram" | "instagram" | "download",
  appOrigin = "https://ichingora.app",
): string {
  const u = new URL(path.replace(/^\//, ""), `${appOrigin.replace(/\/$/, "")}/`);
  u.searchParams.set("utm_source", "sharing");
  u.searchParams.set("utm_medium", medium);
  u.searchParams.set("utm_campaign", "viral");
  return `${u.pathname}${u.search}`;
}
