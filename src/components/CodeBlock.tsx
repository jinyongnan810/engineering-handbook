import { useState, type ReactNode } from "react";

type CodeBlockProps = {
  code: string;
  language: string;
  label: string;
  lines: string[];
};

function renderHighlightedToken(
  token: string,
  language: string,
  key: string,
): ReactNode {
  if (/^(#.*|\/\/.*)$/.test(token)) {
    return (
      <span key={key} className="text-neutral-500">
        {token}
      </span>
    );
  }

  if (/^(['"`]).*\1$/.test(token)) {
    return (
      <span key={key} className="text-emerald-300">
        {token}
      </span>
    );
  }

  if (/^\d+(\.\d+)?$/.test(token)) {
    return (
      <span key={key} className="text-sky-300">
        {token}
      </span>
    );
  }

  const pythonKeywords =
    /^(and|as|assert|async|await|break|class|continue|def|elif|else|except|False|finally|for|from|if|import|in|is|lambda|None|not|or|pass|raise|return|True|try|while|with|yield)$/;
  const typeScriptKeywords =
    /^(abstract|as|async|await|boolean|break|case|catch|class|const|continue|default|else|enum|export|extends|false|finally|for|from|function|if|implements|import|in|interface|let|new|null|number|private|protected|public|readonly|return|string|switch|this|throw|true|try|type|undefined|void|while)$/;

  if (
    (language === "python" && pythonKeywords.test(token)) ||
    (["typescript", "javascript"].includes(language) &&
      typeScriptKeywords.test(token))
  ) {
    return (
      <span key={key} className="text-violet-300">
        {token}
      </span>
    );
  }

  return token;
}

function renderCodeLine(line: string, language: string, lineIndex: number) {
  const tokenPattern =
    language === "python"
      ? /(#.*|"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/g
      : /(\/\/.*|`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][A-Za-z0-9_$]*\b)/g;

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  match = tokenPattern.exec(line);
  while (match) {
    if (match.index > lastIndex) {
      nodes.push(line.slice(lastIndex, match.index));
    }

    nodes.push(
      renderHighlightedToken(
        match[0],
        language,
        `code-${lineIndex}-${match.index}`,
      ),
    );
    lastIndex = tokenPattern.lastIndex;
    match = tokenPattern.exec(line);
  }

  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex));
  }

  return nodes;
}

function CodeBlock({ code, language, label, lines }: CodeBlockProps) {
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
