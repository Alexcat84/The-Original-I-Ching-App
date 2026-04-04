"use client";

import { useState } from "react";
import BoneRitualAnimation, { type BoneOracleResult } from "@/components/BoneRitualAnimation";

type PreviewResult = BoneOracleResult | null;

const RESULT_OPTIONS: Array<{ value: PreviewResult; label: string; verdictText: string | null }> = [
  { value: null, label: "pending", verdictText: null },
  { value: "auspicious_clear", label: "auspicious_clear", verdictText: "Clear favorable (positive charge)" },
  { value: "auspicious_moderate", label: "auspicious_moderate", verdictText: "Moderate favorable (positive charge)" },
  { value: "inauspicious_moderate", label: "inauspicious_moderate", verdictText: "Moderate inauspicious (negative charge)" },
  { value: "inauspicious_clear", label: "inauspicious_clear", verdictText: "Clear inauspicious (negative charge)" },
  { value: "silent", label: "silent", verdictText: "Silence (no answer)" },
];

export default function RitualPreviewPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [oracleResult, setOracleResult] = useState<PreviewResult>(null);

  const selectedOption = RESULT_OPTIONS.find((o) => o.value === oracleResult) ?? RESULT_OPTIONS[0];

  return (
    <main style={{ maxWidth: 980, margin: "1.2rem auto", padding: "0 0.9rem 1.5rem" }}>
      <h1 style={{ margin: "0 0 0.6rem", fontSize: "1.2rem" }}>Bone Ritual Local Preview</h1>
      <p style={{ margin: "0 0 1rem", opacity: 0.85 }}>
        This page renders only the ritual animation. No consult request is sent and no API credits are consumed.
      </p>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span>Processing stage</span>
          <select
            value={isProcessing ? "processing" : "done"}
            onChange={(e) => setIsProcessing(e.target.value === "processing")}
            style={{ padding: "0.5rem", borderRadius: 8 }}
          >
            <option value="processing">processing (fire phase)</option>
            <option value="done">done (cracks/reveal phases)</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span>Oracle result</span>
          <select
            value={selectedOption.label}
            onChange={(e) => {
              const next = RESULT_OPTIONS.find((o) => o.label === e.target.value);
              setOracleResult(next ? next.value : null);
            }}
            style={{ padding: "0.5rem", borderRadius: 8 }}
          >
            {RESULT_OPTIONS.map((o) => (
              <option key={o.label} value={o.label}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <BoneRitualAnimation isProcessing={isProcessing} oracleResult={oracleResult} verdictText={selectedOption.verdictText} />
    </main>
  );
}

