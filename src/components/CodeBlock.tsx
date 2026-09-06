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
  if (
    language === "swift"
      ? /^(\/\/.*|\/\*[\s\S]*?\*\/)$/.test(token)
      : /^(#.*|\/\/.*|\/\*[\s\S]*?\*\/)$/.test(token)
  ) {
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
  const hclKeywords =
    /^(resource|variable|output|module|provider|data|locals|terraform|for|in|if|true|false|null)$/;
  const cppKeywords =
    /^(auto|bool|break|case|catch|char|class|const|constexpr|continue|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|false|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|noexcept|nullptr|operator|override|private|protected|public|reinterpret_cast|return|short|signed|sizeof|static|static_cast|struct|switch|template|this|thread_local|throw|true|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while)$/;
  const swiftKeywords =
    /^(actor|any|Any|as|associatedtype|async|await|break|case|catch|class|continue|default|defer|deinit|do|double|dynamic|else|enum|extension|fallthrough|false|fileprivate|final|for|func|guard|if|import|in|init|inout|internal|is|isolated|lazy|let|mutating|nil|nonisolated|nonmutating|open|operator|optional|override|precedencegroup|private|protocol|public|repeat|required|rethrows|return|self|Self|some|static|struct|subscript|super|switch|throw|throws|true|try|typealias|unowned|var|weak|where|while|yield|Bool|Double|Float|Int|String|Void)$/;

  if (
    (language === "python" && pythonKeywords.test(token)) ||
    (["typescript", "javascript"].includes(language) &&
      typeScriptKeywords.test(token)) ||
    (language === "hcl" && hclKeywords.test(token)) ||
    (language === "cpp" && cppKeywords.test(token)) ||
    (language === "swift" &&
      (swiftKeywords.test(token) ||
        /^@[A-Za-z_][A-Za-z0-9_]*$/.test(token) ||
        /^#[A-Za-z_][A-Za-z0-9_]*$/.test(token)))
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
      : language === "hcl"
        ? /(#.*|\/\/.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/g
        : language === "cpp"
          ? /(\/\/.*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/g
          : language === "swift"
            ? /(\/\/.*|\/\*[\s\S]*?\*\/|"""[\s\S]*?"""|"(?:\\.|[^"\\])*"|\b\d+(?:\.\d+)?\b|@[A-Za-z_][A-Za-z0-9_]*|#[A-Za-z_][A-Za-z0-9_]*|\b[A-Za-z_][A-Za-z0-9_]*\b)/g
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
    language === "javascript" ||
    language === "hcl" ||
    language === "cpp" ||
    language === "swift";

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
      <pre className="overflow-hidden px-4 py-4 text-sm leading-7 text-neutral-50">
        <code
          className={`grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 ${
            language ? `language-${language}` : ""
          }`}
        >
          {lines.map((line, lineIndex) => (
            <span key={`line-${lineIndex}`} className="contents">
              <span
                aria-hidden="true"
                className="select-none text-right tabular-nums text-neutral-600"
              >
                {lineIndex + 1}
              </span>
              <span className="min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                {canHighlight
                  ? renderCodeLine(line, language, lineIndex)
                  : line}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export default CodeBlock;
