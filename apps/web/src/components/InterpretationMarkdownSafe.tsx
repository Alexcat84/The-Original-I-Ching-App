"use client";

import { Component, type ErrorInfo } from "react";
import { OracleInterpretationMarkdown } from "@/components/OracleInterpretationMarkdown";

type Props = {
  partial: string;
  full: string;
};

type State = { useFull: boolean };

/**
 * If react-markdown throws on a partial string during reveal, fall back to the full interpretation.
 */
export class InterpretationMarkdownSafe extends Component<Props, State> {
  state: State = { useFull: false };

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    if (props.partial === props.full && state.useFull) {
      return { useFull: false };
    }
    return null;
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.setState({ useFull: true });
  }

  render() {
    const text =
      this.state.useFull || this.props.partial === this.props.full ? this.props.full : this.props.partial;
    return <OracleInterpretationMarkdown text={text} />;
  }
}
