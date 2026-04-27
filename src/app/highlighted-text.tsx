import { Fragment } from "react";

type HighlightedTextProps = {
  text: string;
  query: string;
  className?: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildHighlightPattern(query: string) {
  const terms = query
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  if (terms.length === 0) {
    return null;
  }

  return new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
}

export function HighlightedText({
  text,
  query,
  className,
}: HighlightedTextProps) {
  const pattern = buildHighlightPattern(query);

  if (!pattern) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(pattern);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = pattern.test(part);
        pattern.lastIndex = 0;

        if (!isMatch) {
          return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
        }

        return (
          <mark key={`${part}-${index}`} className="hl-mark text-inherit">
            {part}
          </mark>
        );
      })}
    </span>
  );
}
