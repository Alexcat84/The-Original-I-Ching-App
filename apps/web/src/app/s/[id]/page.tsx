import type { Metadata } from "next";
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
  const firstConsultImage = data.consultations[0]?.imageUrl;
  return (
    <main className="oracle-shell">
      <section className="oracle-card">
        <p className="eyebrow">Sesión archivada</p>
        <h1>{data.session.title}</h1>
        <p>Total de lecturas: {data.consultations.length}</p>
        <div className="session-actions">
          {firstConsultImage ? (
            <a className="secondary-btn" href={firstConsultImage} target="_blank" rel="noreferrer" download>
              Descargar imagen
            </a>
          ) : null}
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

