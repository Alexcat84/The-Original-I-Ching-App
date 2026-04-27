"use client";

import { isValidElement } from "react";
import ReactMarkdown from "react-markdown";

type Props = {
  text: string;
};

function textFromNodes(node: unknown): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number" || typeof node === "bigint") return String(node);
  if (Array.isArray(node)) return node.map(textFromNodes).join("");
  if (isValidElement(node)) {
    const props = node.props as { children?: unknown };
    return textFromNodes(props.children);
  }
  return "";
}

/** Model often appends a one-line copyright; keep left-aligned while body stays justified. */
function isRightsReservedParagraph(plain: string): boolean {
  const t = plain.replace(/\s+/g, " ").trim();
  if (!t) return false;
  if (t.includes("©")) return true;
  if (
    /rights reserved|derechos reservados|tous droits|r[eé]serv[eé]s|rechte vorbehalten|diritti riservati|판권|保留所有|無断複写|転載を禁/i.test(
      t,
    )
  ) {
    return true;
  }
  if (/theoriginaliching\.com/i.test(t)) return true;
  return false;
}

export function OracleInterpretationMarkdown({ text }: Props) {
  return (
    <ReactMarkdown
      className="oracle-md"
      components={{
        h2: ({ children }) => <h2 className="oracle-md-h2">{children}</h2>,
        h3: ({ children }) => <h3 className="oracle-md-h3">{children}</h3>,
        p: ({ children }) => {
          const plain = textFromNodes(children);
          const rightsLine = isRightsReservedParagraph(plain);
          return (
            <p className={rightsLine ? "oracle-md-p oracle-md-p--rights-line" : "oracle-md-p"}>{children}</p>
          );
        },
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
