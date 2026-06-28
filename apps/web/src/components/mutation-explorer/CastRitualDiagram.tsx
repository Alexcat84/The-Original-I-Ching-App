"use client";

const LINE_ORDER = [6, 5, 4, 3, 2, 1] as const;

function isYang(value: number): boolean {
  return value === 7 || value === 9;
}

function isChanging(value: number): boolean {
  return value === 6 || value === 9;
}

function toTransformedValue(value: number): number {
  if (value === 6) return 7;
  if (value === 9) return 8;
  return value;
}

function YangBar() {
  return <span className="ritual-hex-line ritual-hex-line--yang" aria-hidden />;
}

function YinBar() {
  return (
    <span className="ritual-hex-line ritual-hex-line--yin" aria-hidden>
      <span />
      <span />
    </span>
  );
}

type Props = {
  /** Line values bottom-first (positions 1–6), each 6|7|8|9. */
  lines: number[];
};

/**
 * Static primary → transformed line grid (same markup as the coin ritual finale).
 */
export function CastRitualDiagram({ lines }: Props) {
  const byPosition = new Map<number, number>();
  lines.forEach((value, index) => {
    byPosition.set(index + 1, value);
  });

  return (
    <div className="ritual-lines-grid mutation-explorer-ritual-grid" aria-hidden="true">
      {LINE_ORDER.map((position) => {
        const value = byPosition.get(position) ?? 7;
        const changing = isChanging(value);
        const sourceYang = isYang(value);
        const transformedYang = isYang(toTransformedValue(value));

        return (
          <div key={position} className="ritual-line-row">
            <div
              className={`ritual-line-slot ritual-line-slot--source is-visible${changing ? " is-changing" : ""}`}
            >
              {sourceYang ? <YangBar /> : <YinBar />}
            </div>
            <div className="ritual-arrow-slot is-visible">
              <span className="ritual-arrow">→</span>
            </div>
            <div
              className={`ritual-line-slot ritual-line-slot--transformed is-visible${changing ? " is-changing" : ""}`}
            >
              {transformedYang ? <YangBar /> : <YinBar />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
