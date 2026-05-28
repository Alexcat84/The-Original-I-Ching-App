"use client";
import type { TooltipRenderProps } from "react-joyride";

export function TourTooltip({
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
  step,
  index,
  isLastStep,
  size,
}: TooltipRenderProps) {
  const locale = step.locale ?? {};
  const backLabel = locale.back ?? "Back";
  const nextLabel = isLastStep ? (locale.last ?? "Done") : (locale.next ?? "Next");
  const skipLabel = locale.skip ?? "Skip";

  return (
    <div
      {...tooltipProps}
      style={{
        background: "color-mix(in srgb, var(--bg-mid, #f2f8fc) 92%, var(--accent))",
        border: "1px solid color-mix(in srgb, var(--accent) 35%, var(--bar-border))",
        borderRadius: "clamp(14px, 3vw, 20px)",
        boxShadow: "var(--shadow, 0 2px 12px rgba(0,0,0,.1)), 0 12px 40px rgba(0,0,0,.18)",
        padding: "20px 22px 18px",
        maxWidth: "min(340px, 88vw)",
        width: "min(340px, 88vw)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        fontFamily: "var(--font-oracle-display, serif)",
      }}
    >
      {/* Step progress bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {Array.from({ length: size }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background:
                i <= index
                  ? "var(--accent)"
                  : "color-mix(in srgb, var(--fg-muted, #4a6573) 22%, transparent)",
              transition: "background 0.25s ease",
            }}
          />
        ))}
      </div>

      {/* Step counter */}
      <div
        style={{
          color: "var(--accent)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: step.title ? 4 : 0,
          opacity: 0.8,
        }}
      >
        {index + 1} / {size}
      </div>

      {/* Title */}
      {step.title && (
        <div
          style={{
            color: "var(--fg)",
            fontWeight: 700,
            fontSize: 15,
            lineHeight: 1.3,
            marginBottom: 8,
          }}
        >
          {step.title}
        </div>
      )}

      {/* Body */}
      <div
        style={{
          color: "var(--fg-muted)",
          fontSize: 13,
          lineHeight: 1.6,
          marginBottom: 20,
        }}
      >
        {step.content}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        {/* Skip */}
        <button
          {...skipProps}
          style={{
            background: "none",
            border: "none",
            padding: "4px 0",
            color: "var(--fg-muted)",
            fontSize: 12,
            cursor: "pointer",
            opacity: 0.7,
            textDecoration: "underline",
            textDecorationColor: "color-mix(in srgb, var(--fg-muted) 40%, transparent)",
            flexShrink: 0,
          }}
        >
          {skipLabel}
        </button>

        {/* Back + Next */}
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          {index > 0 && (
            <button
              {...backProps}
              style={{
                background: "none",
                border: "1px solid color-mix(in srgb, var(--fg-muted) 30%, transparent)",
                borderRadius: 10,
                padding: "7px 15px",
                color: "var(--fg-muted)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              {backLabel}
            </button>
          )}
          <button
            {...primaryProps}
            style={{
              background: "var(--accent)",
              border: "none",
              borderRadius: 10,
              padding: "7px 18px",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.04em",
              boxShadow: "0 2px 8px color-mix(in srgb, var(--accent) 45%, transparent)",
            }}
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
