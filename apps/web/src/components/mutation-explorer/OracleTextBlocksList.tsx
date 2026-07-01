"use client";

import type { MutationExplorerUiMessages } from "@iching-oracle/i18n";
import type { OracleTextBlock } from "@/lib/mutation-explorer/explore-mutation";

type Props = {
  blocks: OracleTextBlock[];
  ui: MutationExplorerUiMessages;
  /** Disambiguates React keys so open/closed state is per translator tab. */
  listId: string;
};

export function OracleTextBlocksList({ blocks, ui, listId }: Props) {
  return (
    <div className="mutation-explorer-oracle-blocks">
      {blocks.map((block) => (
        <article
          key={`${listId}-${block.id}`}
          className={`mutation-explorer-oracle-block${block.isRead ? " mutation-explorer-oracle-block--read" : ""}`}
        >
          <details className="mutation-explorer-oracle-details" open={block.isRead}>
            <summary className="mutation-explorer-oracle-summary">
              <span className="mutation-explorer-oracle-toggle" aria-hidden="true" />
              <span className="mutation-explorer-oracle-heading">
                {block.heading}
                {block.isRead && block.emphasis === "primary" ? (
                  <span className="mutation-explorer-badge">{ui.primaryEmphasis}</span>
                ) : null}
                {block.isRead && block.emphasis === "secondary" ? (
                  <span className="mutation-explorer-badge">{ui.secondaryEmphasis}</span>
                ) : null}
              </span>
            </summary>
            <blockquote className="mutation-explorer-oracle-body">{block.text}</blockquote>
          </details>
        </article>
      ))}
    </div>
  );
}
