"use client";

const LINE_ORDER = [6, 5, 4, 3, 2, 1] as const;

export type CastHexHeader = {
  number: number;
  chineseName: string;
  name: string;
};

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
  primaryHeader?: CastHexHeader | null;
  transformedHeader?: CastHexHeader | null;
};

function HexHeader({ header }: { header: CastHexHeader }) {
  return (
    <header className="mutation-explorer-cast-header">
      <span className="mutation-explorer-cast-hex-title" lang="zh">
        #{header.number} {header.chineseName}
      </span>
      <span className="mutation-explorer-cast-hex-sub">{header.name}</span>
    </header>
  );
}

/**
 * Header slot for one column. Renders the real header when present; otherwise, if
 * the OTHER column has a header (`reserve`), renders a structurally-identical but
 * invisible placeholder so both line stacks start at the same y. Without this, a
 * no-changing-lines reading (transformedHeader null) left the right hexagram
 * shifted up by the header height — the misalignment reported on #1/#7/#27/#29.
 */
function HeaderSlot({ header, reserve }: { header?: CastHexHeader | null; reserve: boolean }) {
  if (header) return <HexHeader header={header} />;
  if (!reserve) return null;
  return (
    <header className="mutation-explorer-cast-header" aria-hidden="true" data-placeholder="true">
      <span className="mutation-explorer-cast-hex-title">&nbsp;</span>
      <span className="mutation-explorer-cast-hex-sub">&nbsp;</span>
    </header>
  );
}

/**
 * Primary → transformed cast with per-column titles centered above each hex stack.
 */
export function CastRitualDiagram({ lines, primaryHeader, transformedHeader }: Props) {
  const byPosition = new Map<number, number>();
  lines.forEach((value, index) => {
    byPosition.set(index + 1, value);
  });

  const reserveHeader = Boolean(primaryHeader || transformedHeader);

  // No changing lines ⇒ no transformation. The "transformed" hexagram would be
  // identical to the primary (toTransformedValue leaves 7/8 unchanged), so a
  // right column + arrows would draw a meaningless "頤 → 頤" that contradicts the
  // "solo el dictamen del hexagrama primario" caption. Render a single hexagram.
  const hasChanging = lines.some((v) => v === 6 || v === 9);

  if (!hasChanging) {
    return (
      <div
        className="mutation-explorer-cast-grid mutation-explorer-cast-grid--single"
        aria-hidden="true"
      >
        <div className="mutation-explorer-cast-column">
          {primaryHeader ? <HexHeader header={primaryHeader} /> : null}
          <div className="mutation-explorer-cast-lines">
            {LINE_ORDER.map((position) => {
              const value = byPosition.get(position) ?? 7;
              return (
                <div
                  key={`single-${position}`}
                  className="ritual-line-slot ritual-line-slot--source is-visible"
                >
                  {isYang(value) ? <YangBar /> : <YinBar />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mutation-explorer-cast-grid" aria-hidden="true">
      <div className="mutation-explorer-cast-column">
        <HeaderSlot header={primaryHeader} reserve={reserveHeader} />
        <div className="mutation-explorer-cast-lines">
          {LINE_ORDER.map((position) => {
            const value = byPosition.get(position) ?? 7;
            const changing = isChanging(value);
            const sourceYang = isYang(value);
            return (
              <div
                key={`source-${position}`}
                className={`ritual-line-slot ritual-line-slot--source is-visible${changing ? " is-changing" : ""}`}
              >
                {sourceYang ? <YangBar /> : <YinBar />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mutation-explorer-cast-arrows">
        {primaryHeader || transformedHeader ? (
          <div className="mutation-explorer-cast-arrow-spacer" aria-hidden="true" />
        ) : null}
        {LINE_ORDER.map((position) => (
          <div key={`arrow-${position}`} className="ritual-arrow-slot is-visible">
            <span className="ritual-arrow">→</span>
          </div>
        ))}
      </div>

      <div className="mutation-explorer-cast-column">
        <HeaderSlot header={transformedHeader} reserve={reserveHeader} />
        <div className="mutation-explorer-cast-lines">
          {LINE_ORDER.map((position) => {
            const value = byPosition.get(position) ?? 7;
            const transformedYang = isYang(toTransformedValue(value));
            return (
              <div
                key={`transformed-${position}`}
                className="ritual-line-slot ritual-line-slot--transformed is-visible"
              >
                {transformedYang ? <YangBar /> : <YinBar />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
