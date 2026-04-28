"use client";

import React from "react";

type MarkdownTextProps = {
  text: string | null | undefined;
  className?: string;
};

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Regex to match **bold** or *italic*
  // We match **...** first, then *...*
  const regex = /(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Push text before match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const matched = match[0];
    if (matched.startsWith("**")) {
      nodes.push(<strong key={match.index}>{matched.slice(2, -2)}</strong>);
    } else if (matched.startsWith("*")) {
      nodes.push(<em key={match.index}>{matched.slice(1, -1)}</em>);
    }

    lastIndex = regex.lastIndex;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function MarkdownText({ text, className = "" }: MarkdownTextProps) {
  if (!text) return null;
  return (
    <span className={className}>
      {parseInlineMarkdown(text)}
    </span>
  );
}
