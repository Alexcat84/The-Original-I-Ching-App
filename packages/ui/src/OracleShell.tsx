import type { ReactNode } from "react";

export function OracleShell(props: {
  title: string;
  children: ReactNode;
  /** Full-bleed chat layout: no default header; page supplies its own chrome. */
  variant?: "default" | "chat";
}) {
  if (props.variant === "chat") {
    return (
      <div className="iching-oracle-shell iching-oracle-shell--chat" data-testid="oracle-shell">
        {props.children}
      </div>
    );
  }
  return (
    <div className="iching-oracle-shell" data-testid="oracle-shell">
      <header>
        <h1>{props.title}</h1>
      </header>
      <main>{props.children}</main>
    </div>
  );
}
