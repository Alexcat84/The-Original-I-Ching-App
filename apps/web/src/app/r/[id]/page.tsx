import type { Metadata } from "next";
import { sharingUtm } from "@iching-oracle/sharing";
import { CopyShareLinkButton } from "@/components/CopyShareLinkButton";
import { CrackPatternGraphic } from "@/components/CrackPatternGraphic";
import { getConsultationByPublicId } from "@/lib/session-store";

interface ReadingPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ReadingPageProps): Promise<Metadata> {
  const row = await getConsultationByPublicId(params.id);
  if (!row) {
    return { title: "Lectura no encontrada" };
  }
  const title =
    row.oracleType === "oracle_bones"
      ? `甲骨文 · ${row.primaryHexagramName}`
      : `I Ching ${row.primaryHexagram}: ${row.primaryHexagramName}`;
  const description = row.interpretation.slice(0, 180);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: row.imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [row.imageUrl],
    },
  };
}

export default async function ReadingPage({ params }: ReadingPageProps) {
  const row = await getConsultationByPublicId(params.id);
  if (!row) {
    return <main className="oracle-shell"><p>Lectura no encontrada.</p></main>;
  }
  const sharePath = `/r/${params.id}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ichingora.app";
  const fullShareUrl = `${appUrl}${sharePath}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(fullShareUrl)}`;
  const x = `https://x.com/intent/tweet?url=${encodeURIComponent(fullShareUrl)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullShareUrl)}`;
  const telegram = `https://t.me/share/url?url=${encodeURIComponent(fullShareUrl)}`;
  return (
    <main className="oracle-shell">
      <section className="oracle-card">
        <p className="eyebrow">Lectura compartida</p>
        <h1>
          {row.oracleType === "oracle_bones" ? "甲骨文" : `${row.primaryHexagram}.`} {row.primaryHexagramName}
        </h1>
        <p>{row.primaryHexagramChinese}</p>
        {row.oracleType === "oracle_bones" && row.oracleBones ? (
          <div className="crack-visual-wrap">
            <CrackPatternGraphic patternId={row.oracleBones.pattern_id} />
            <p className="meta-line">Patrón {row.oracleBones.pattern_id} · {row.oracleBones.verdict}</p>
          </div>
        ) : null}
        <p>{row.interpretation}</p>
        <img src={row.imageUrl} alt={`Imagen de ${row.primaryHexagramName}`} className="oracle-image" />
        <div className="session-actions">
          <a className="secondary-btn" href={whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
          <a className="secondary-btn" href={x} target="_blank" rel="noreferrer">X</a>
          <a className="secondary-btn" href={facebook} target="_blank" rel="noreferrer">Facebook</a>
          <a className="secondary-btn" href={telegram} target="_blank" rel="noreferrer">Telegram</a>
          <CopyShareLinkButton url={fullShareUrl} label="Instagram (copiar enlace)" />
          <a className="secondary-btn" href={row.imageUrl} target="_blank" rel="noreferrer" download>
            Descargar imagen
          </a>
          <a
            className="secondary-btn"
            data-testid="cta-register-btn"
            href={sharingUtm("/register", "whatsapp", appUrl)}
          >
            🔮 Consulta tu propio I Ching — Gratis
          </a>
        </div>
      </section>
    </main>
  );
}

