"use client";

import ReactMarkdown from "react-markdown";

type Props = {
  text: string;
};

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
