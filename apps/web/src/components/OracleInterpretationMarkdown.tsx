"use client";

import ReactMarkdown from "react-markdown";

type Props = {
  text: string;
};

/**
 * A trailing copyright/rights/domain signature the model occasionally appends is removed
 * BEFORE this component ever sees the text (InterpretationBody -> stripInterpretationFluff
 * in apps/web/src/lib/response-clean.ts), non-destructively and display-only. This
 * component used to carry a duplicate per-paragraph classifier for that same signature
 * (`isRightsReservedParagraph`) that left-aligned whichever paragraph matched; it was
 * removed together with the upstream string-level fix rather than kept as a second,
 * redundant layer, since it was also the direct cause of a real bug (2026-08): if the
 * model glued the disclaimer onto the SAME paragraph as real content with no blank line
 * in between, the classifier matched the trigger phrase against the whole merged
 * paragraph and left-aligned the entire visible reading, not just the disclaimer clause.
 */
export function OracleInterpretationMarkdown({ text }: Props) {
  return (
    <ReactMarkdown
      className="oracle-md"
      components={{
        h2: ({ children }) => <h2 className="oracle-md-h2">{children}</h2>,
        h3: ({ children }) => <h3 className="oracle-md-h3">{children}</h3>,
        p: ({ children }) => <p className="oracle-md-p">{children}</p>,
        strong: ({ children }) => <strong className="oracle-md-strong">{children}</strong>,
        em: ({ children }) => <em className="oracle-md-em">{children}</em>,
        blockquote: ({ children }) => <blockquote className="oracle-md-quote">{children}</blockquote>,
        ol: ({ children }) => <ol className="oracle-md-ol">{children}</ol>,
        ul: ({ children }) => <ul className="oracle-md-ul">{children}</ul>,
        li: ({ children }) => <li className="oracle-md-li">{children}</li>,
        hr: () => <hr className="oracle-md-hr" />,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
