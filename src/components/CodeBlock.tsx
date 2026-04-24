import { useState, type ReactNode } from "react";

type CodeBlockProps = {
  code: string;
  language: string;
  label: string;
  lines: string[];
  renderCodeLine: (
    line: string,
    language: string,
    lineIndex: number,
  ) => ReactNode[];
};

function CodeBlock({
  code,
  language,
  label,
  lines,
  renderCodeLine,
}: CodeBlockProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const canHighlight =
    language === "python" ||
    language === "typescript" ||
    language === "javascript";

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1400);
  }

  return (
    <div className="max-w-3xl overflow-hidden rounded-lg bg-neutral-950">
      <div className="flex min-h-10 items-center justify-between gap-4 border-b border-white/10 px-4 py-2">
        <div className="text-xs font-medium text-neutral-400">{label}</div>
        <button
          type="button"
          onClick={() => {
            void copyCode();
          }}
          className="rounded-md px-2 py-1 text-xs font-medium text-neutral-400 transition hover:bg-white/10 hover:text-neutral-50"
        >
          {copyState === "copied" ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-sm leading-7 text-neutral-50">
        <code className={language ? `language-${language}` : undefined}>
          {canHighlight
            ? lines.map((line, lineIndex) => (
                <span key={`line-${lineIndex}`} className="block">
                  {renderCodeLine(line, language, lineIndex)}
                </span>
              ))
            : code}
        </code>
      </pre>
    </div>
  );
}

export default CodeBlock;
