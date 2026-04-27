import type { OracleBonesVerdict } from "@iching-oracle/oracle-bones-engine";
import type { Metadata } from "next";
import { getConsultationByPublicId } from "@/lib/session-store";
import { oracleBonesVerdictChinese } from "@/lib/oracle-bones-verdict-glyph";

interface ReadingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ReadingPageProps): Promise<Metadata> {
  const { id } = await params;
  const row = await getConsultationByPublicId(id);
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
  const { id } = await params;
  const row = await getConsultationByPublicId(id);
  if (!row) {
    return <main className="oracle-shell"><p>Lectura no encontrada.</p></main>;
  }
  return (
    <main className="oracle-shell">
      <section className="oracle-card">
        <p className="eyebrow">Lectura archivada</p>
        <h1>
          {row.oracleType === "oracle_bones" ? "甲骨文" : `${row.primaryHexagram}.`} {row.primaryHexagramName}
        </h1>
        <p>{row.primaryHexagramChinese}</p>
        {row.oracleType === "oracle_bones" && row.oracleBones ? (
          <div className="crack-visual-wrap">
            <p className="bones-archived-verdict-glyph" aria-hidden="true">
              {oracleBonesVerdictChinese(row.oracleBones.verdict as OracleBonesVerdict)}
            </p>
            <p className="meta-line">Patrón {row.oracleBones.pattern_id} · {row.oracleBones.verdict}</p>
          </div>
        ) : null}
        <p>{row.interpretation}</p>
        <img src={row.imageUrl} alt={`Imagen de ${row.primaryHexagramName}`} className="oracle-image" />
        <div className="session-actions">
          <a className="secondary-btn" href={row.imageUrl} target="_blank" rel="noreferrer" download>
            Descargar imagen
          </a>
        </div>
      </section>
    </main>
  );
}

