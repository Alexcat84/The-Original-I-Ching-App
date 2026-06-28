"use client";

import type { MutationExplorerUiMessages } from "@iching-oracle/i18n";
import type { OracleTextBlock } from "@/lib/mutation-explorer/explore-mutation";

type Props = {
  blocks: OracleTextBlock[];
  ui: MutationExplorerUiMessages;
};

export function OracleTextBlocksList({ blocks, ui }: Props) {
  return (
    <div className="mutation-explorer-oracle-blocks">
      {blocks.map((block) => (
        <article key={block.id} className="mutation-explorer-oracle-block">
          <h4>
            {block.heading}
            {block.emphasis === "primary" ? (
              <span className="mutation-explorer-badge">{ui.primaryEmphasis}</span>
            ) : null}
            {block.emphasis === "secondary" ? (
              <span className="mutation-explorer-badge">{ui.secondaryEmphasis}</span>
            ) : null}
          </h4>
          <blockquote>{block.text}</blockquote>
        </article>
      ))}
    </div>
  );
}
