import type { Metadata } from "next";
import { sharingUtm } from "@iching-oracle/sharing";
import { CopyShareLinkButton } from "@/components/CopyShareLinkButton";
import { getSessionByPublicId } from "@/lib/session-store";

interface SessionPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: SessionPageProps): Promise<Metadata> {
  const data = await getSessionByPublicId(params.id);
  if (!data) return { title: "Sesión no encontrada" };
  const title = `Sesión I Ching: ${data.session.title}`;
  const description = `Consultas: ${data.consultations.length}. Tema: ${data.session.themeCategory}.`;
  const firstImage = data.consultations[0]?.imageUrl;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: firstImage ? [{ url: firstImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: firstImage ? [firstImage] : [],
    },
  };
}

export default async function SessionPage({ params }: SessionPageProps) {
  const data = await getSessionByPublicId(params.id);
  if (!data) {
    return <main className="oracle-shell"><p>Sesión no encontrada.</p></main>;
  }
  const sharePath = `/s/${params.id}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ichingora.app";
  const fullShareUrl = `${appUrl}${sharePath}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(fullShareUrl)}`;
  const x = `https://x.com/intent/tweet?url=${encodeURIComponent(fullShareUrl)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullShareUrl)}`;
  const telegram = `https://t.me/share/url?url=${encodeURIComponent(fullShareUrl)}`;
  const firstConsultImage = data.consultations[0]?.imageUrl;
  return (
    <main className="oracle-shell">
      <section className="oracle-card">
        <p className="eyebrow">Sesión compartida</p>
        <h1>{data.session.title}</h1>
        <p>Total de lecturas: {data.consultations.length}</p>
        <div className="session-actions">
          <a className="secondary-btn" href={whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
          <a className="secondary-btn" href={x} target="_blank" rel="noreferrer">X</a>
          <a className="secondary-btn" href={facebook} target="_blank" rel="noreferrer">Facebook</a>
          <a className="secondary-btn" href={telegram} target="_blank" rel="noreferrer">Telegram</a>
          <CopyShareLinkButton url={fullShareUrl} label="Instagram (copiar enlace)" />
          {firstConsultImage ? (
            <a className="secondary-btn" href={firstConsultImage} target="_blank" rel="noreferrer" download>
              Descargar imagen
            </a>
          ) : null}
          <a
            className="secondary-btn"
            data-testid="cta-register-btn"
            href={sharingUtm("/register", "facebook", appUrl)}
          >
            🔮 Consulta tu propio I Ching — Gratis
          </a>
        </div>
        <div className="reading-grid">
          {data.consultations.slice(0, 3).map((row) => (
            <img key={row.consultationId} src={row.imageUrl} alt="Collage de sesión" className="oracle-image" />
          ))}
        </div>
        {data.consultations.map((row) => (
          <article key={row.consultationId} className="oracle-panel" data-testid="session-consultation">
            <h3>{row.sessionPosition}. {row.primaryHexagram}. {row.primaryHexagramName}</h3>
            <p>{row.question}</p>
            <p>{row.interpretation}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

