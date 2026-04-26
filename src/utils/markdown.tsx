import type { ReactNode } from "react";
import CodeBlock from "../components/CodeBlock";

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "code"; lines: string[]; language: string }
  | { type: "math"; lines: string[] }
  | { type: "blockquote"; lines: string[] }
  | { type: "rule" };

export type MarkdownHeading = {
  id: string;
  level: number;
  text: string;
};

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/`|\*|\[|\]|\(|\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed === "---") {
      blocks.push({ type: "rule" });
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const language = trimmed.replace(/^```/, "").trim().split(/\s+/)[0] ?? "";
      index += 1;
      const codeLines: string[] = [];
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push({ type: "code", lines: codeLines, language });
      continue;
    }

    if (trimmed === "$$") {
      index += 1;
      const mathLines: string[] = [];
      while (index < lines.length && lines[index].trim() !== "$$") {
        mathLines.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push({ type: "math", lines: mathLines });
      continue;
    }

    if (
      trimmed.startsWith("$$") &&
      trimmed.endsWith("$$") &&
      trimmed.length > 4
    ) {
      blocks.push({ type: "math", lines: [trimmed.slice(2, -2).trim()] });
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      index += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "blockquote", lines: quoteLines });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "unordered-list", items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "ordered-list", items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length && lines[index].trim()) {
      const current = lines[index].trim();
      if (
        current === "---" ||
        current.startsWith("```") ||
        current === "$$" ||
        current.startsWith(">") ||
        /^#{1,6}\s+/.test(current) ||
        /^[-*]\s+/.test(current) ||
        /^\d+\.\s+/.test(current)
      ) {
        break;
      }
      paragraphLines.push(current);
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

function getHeadingId(text: string, counts: Map<string, number>) {
  const baseId = slugifyHeading(text) || "section";
  const count = counts.get(baseId) ?? 0;
  counts.set(baseId, count + 1);

  if (count === 0) {
    return baseId;
  }

  return `${baseId}-${count + 1}`;
}

const latexSymbols: Record<string, string> = {
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ε",
  theta: "θ",
  lambda: "λ",
  mu: "μ",
  pi: "π",
  rho: "ρ",
  sigma: "σ",
  tau: "τ",
  phi: "φ",
  omega: "ω",
  Gamma: "Γ",
  Delta: "Δ",
  Theta: "Θ",
  Lambda: "Λ",
  Pi: "Π",
  Sigma: "Σ",
  Phi: "Φ",
  Omega: "Ω",
  cdot: "·",
  times: "×",
  div: "÷",
  pm: "±",
  leq: "≤",
  geq: "≥",
  neq: "≠",
  approx: "≈",
  infty: "∞",
  sum: "∑",
  prod: "∏",
  int: "∫",
  partial: "∂",
  nabla: "∇",
  cdots: "⋯",
  ldots: "…",
  vdots: "⋮",
  ddots: "⋱",
  to: "→",
  rightarrow: "→",
  leftarrow: "←",
  in: "∈",
  notin: "∉",
  subset: "⊂",
  subseteq: "⊆",
  cup: "∪",
  cap: "∩",
};

function readLatexGroup(text: string, startIndex: number) {
  if (text[startIndex] !== "{") {
    return {
      value: text[startIndex] ?? "",
      endIndex: Math.min(startIndex + 1, text.length),
    };
  }

  let depth = 0;
  for (let index = startIndex; index < text.length; index += 1) {
    if (text[index] === "{") {
      depth += 1;
    } else if (text[index] === "}") {
      depth -= 1;
      if (depth === 0) {
        return {
          value: text.slice(startIndex + 1, index),
          endIndex: index + 1,
        };
      }
    }
  }

  return { value: text.slice(startIndex + 1), endIndex: text.length };
}

function renderLatexInline(latex: string, keyPrefix = "math"): ReactNode[] {
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < latex.length) {
    const char = latex[index];

    if (char === "\\") {
      if (latex[index + 1] === "\\") {
        nodes.push(<br key={`${keyPrefix}-br-${index}`} />);
        index += 2;
        continue;
      }

      const commandMatch = latex.slice(index + 1).match(/^[A-Za-z]+/);
      const command = commandMatch?.[0] ?? latex[index + 1] ?? "";

      if (command === "frac") {
        const numerator = readLatexGroup(latex, index + command.length + 1);
        const denominator = readLatexGroup(latex, numerator.endIndex);
        nodes.push(
          <span
            key={`${keyPrefix}-frac-${index}`}
            className="mx-0.5 inline-flex translate-y-[0.12em] flex-col items-center align-middle text-[0.88em] leading-none"
          >
            <span className="border-b border-current px-1 pb-0.5">
              {renderLatexInline(numerator.value, `${keyPrefix}-num-${index}`)}
            </span>
            <span className="px-1 pt-0.5">
              {renderLatexInline(
                denominator.value,
                `${keyPrefix}-den-${index}`,
              )}
            </span>
          </span>,
        );
        index = denominator.endIndex;
        continue;
      }

      if (command === "sqrt") {
        const radicand = readLatexGroup(latex, index + command.length + 1);
        nodes.push(
          <span key={`${keyPrefix}-sqrt-${index}`} className="inline-flex">
            <span>√</span>
            <span className="border-t border-current px-1">
              {renderLatexInline(radicand.value, `${keyPrefix}-sqrtv-${index}`)}
            </span>
          </span>,
        );
        index = radicand.endIndex;
        continue;
      }

      if (["left", "right"].includes(command)) {
        index += command.length + 1;
        continue;
      }

      nodes.push(latexSymbols[command] ?? command);
      index += command.length + 1;
      continue;
    }

    if (char === "_" || char === "^") {
      const group = readLatexGroup(latex, index + 1);
      const Tag = char === "_" ? "sub" : "sup";
      nodes.push(
        <Tag key={`${keyPrefix}-${char}-${index}`}>
          {renderLatexInline(group.value, `${keyPrefix}-script-${index}`)}
        </Tag>,
      );
      index = group.endIndex;
      continue;
    }

    if (char === "{" || char === "}") {
      index += 1;
      continue;
    }

    nodes.push(char);
    index += 1;
  }

  return nodes;
}

function renderLatexMatrix(latex: string, keyPrefix: string) {
  const matrixMatch = latex.match(
    /\\begin\{([pbvB]?matrix)\}([\s\S]*?)\\end\{\1\}/,
  );

  if (!matrixMatch) {
    return null;
  }

  const before = latex.slice(0, matrixMatch.index).trim();
  const after = latex
    .slice((matrixMatch.index ?? 0) + matrixMatch[0].length)
    .trim();
  const rows = matrixMatch[2]
    .split(/\\\\/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split("&").map((cell) => cell.trim()));

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {before ? (
        <span>{renderLatexInline(before, `${keyPrefix}-before`)}</span>
      ) : null}
      <span className="inline-flex items-stretch font-serif text-[1.08em]">
        <span className="rounded-l border-y-2 border-l-2 border-neutral-600 px-1 dark:border-neutral-400" />
        <span className="grid gap-x-5 gap-y-2 px-2">
          {rows.map((row, rowIndex) => (
            <span
              key={`${keyPrefix}-row-${rowIndex}`}
              className="grid grid-flow-col auto-cols-fr gap-x-5 text-center"
            >
              {row.map((cell, cellIndex) => (
                <span key={`${keyPrefix}-cell-${rowIndex}-${cellIndex}`}>
                  {renderLatexInline(
                    cell,
                    `${keyPrefix}-cell-${rowIndex}-${cellIndex}`,
                  )}
                </span>
              ))}
            </span>
          ))}
        </span>
        <span className="rounded-r border-y-2 border-r-2 border-neutral-600 px-1 dark:border-neutral-400" />
      </span>
      {after ? (
        <span>{renderLatexInline(after, `${keyPrefix}-after`)}</span>
      ) : null}
    </div>
  );
}

function renderDisplayMath(latex: string, key: string) {
  const matrix = renderLatexMatrix(latex, key);

  return (
    <div
      key={key}
      className="max-w-3xl overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-4 text-center font-serif text-[18px] leading-8 text-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
    >
      {matrix ?? renderLatexInline(latex, key)}
    </div>
  );
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /(`[^`]+`)|(\$[^$\n]+\$)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  match = pattern.exec(text);
  while (match) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("`")) {
      nodes.push(
        <code
          key={`${token}-${match.index}`}
          className="rounded bg-neutral-100 px-1.5 py-0.5 text-[0.92em] text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("$")) {
      nodes.push(
        <span
          key={`${token}-${match.index}`}
          className="whitespace-nowrap font-serif text-[1.04em] text-neutral-950 dark:text-neutral-100"
        >
          {renderLatexInline(token.slice(1, -1), `inline-${match.index}`)}
        </span>,
      );
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${token}-${match.index}`} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("*")) {
      nodes.push(
        <em key={`${token}-${match.index}`} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        nodes.push(
          <a
            key={`${token}-${match.index}`}
            href={linkMatch[2]}
            className="font-medium text-[#06c] underline underline-offset-4 transition hover:text-[#004a99] dark:text-[#2997ff] dark:hover:text-[#7abfff]"
          >
            {linkMatch[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    }

    lastIndex = pattern.lastIndex;
    match = pattern.exec(text);
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function normalizeCodeLanguage(language: string) {
  const normalizedLanguage = language.toLowerCase();

  if (["py", "python"].includes(normalizedLanguage)) {
    return "python";
  }

  if (["ts", "tsx", "typescript"].includes(normalizedLanguage)) {
    return "typescript";
  }

  if (["js", "jsx", "javascript"].includes(normalizedLanguage)) {
    return "javascript";
  }

  return normalizedLanguage;
}

function getCodeLanguageLabel(language: string) {
  const normalizedLanguage = normalizeCodeLanguage(language);

  if (normalizedLanguage === "python") {
    return "Python";
  }

  if (normalizedLanguage === "typescript") {
    return "TypeScript";
  }

  if (normalizedLanguage === "javascript") {
    return "JavaScript";
  }

  return language;
}

export function getMarkdownHeadings(markdown: string): MarkdownHeading[] {
  const counts = new Map<string, number>();

  return parseBlocks(markdown)
    .filter((block): block is Extract<Block, { type: "heading" }> => {
      return block.type === "heading";
    })
    .map((block) => ({
      id: getHeadingId(block.text, counts),
      level: block.level,
      text: block.text,
    }));
}

export function renderMarkdown(markdown: string): ReactNode[] {
  const headingCounts = new Map<string, number>();

  return parseBlocks(markdown).map((block, index) => {
    if (block.type === "heading") {
      const id = getHeadingId(block.text, headingCounts);

      if (block.level === 1) {
        return (
          <h1
            key={`heading-${index}`}
            id={id}
            className="scroll-mt-24 text-5xl font-semibold tracking-tight text-balance text-neutral-950 dark:text-neutral-100 sm:text-6xl"
          >
            {renderInline(block.text)}
          </h1>
        );
      }

      if (block.level <= 2) {
        return (
          <h2
            key={`heading-${index}`}
            id={id}
            className="scroll-mt-24 pt-6 text-3xl font-semibold tracking-tight text-balance text-neutral-950 dark:text-neutral-100"
          >
            {renderInline(block.text)}
          </h2>
        );
      }

      return (
        <h3
          key={`heading-${index}`}
          id={id}
          className="scroll-mt-24 pt-3 text-xl font-semibold tracking-tight text-balance text-neutral-950 dark:text-neutral-100"
        >
          {renderInline(block.text)}
        </h3>
      );
    }

    if (block.type === "paragraph") {
      return (
        <p
          key={`paragraph-${index}`}
          className="max-w-3xl text-[17px] leading-8 text-neutral-800 dark:text-neutral-300"
        >
          {renderInline(block.text)}
        </p>
      );
    }

    if (block.type === "unordered-list") {
      return (
        <ul
          key={`unordered-${index}`}
          className="max-w-3xl list-disc space-y-2 pl-6 text-[17px] leading-8 text-neutral-800 dark:text-neutral-300"
        >
          {block.items.map((item, itemIndex) => (
            <li key={`unordered-${index}-${itemIndex}`}>
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
    }

    if (block.type === "ordered-list") {
      return (
        <ol
          key={`ordered-${index}`}
          className="max-w-3xl list-decimal space-y-2 pl-6 text-[17px] leading-8 text-neutral-800 dark:text-neutral-300"
        >
          {block.items.map((item, itemIndex) => (
            <li key={`ordered-${index}-${itemIndex}`}>{renderInline(item)}</li>
          ))}
        </ol>
      );
    }

    if (block.type === "blockquote") {
      return (
        <blockquote
          key={`blockquote-${index}`}
          className="max-w-3xl border-l border-neutral-300 pl-4 italic text-neutral-700 dark:border-neutral-700 dark:text-neutral-400"
        >
          {block.lines.map((line, lineIndex) => (
            <p key={`blockquote-${index}-${lineIndex}`}>{renderInline(line)}</p>
          ))}
        </blockquote>
      );
    }

    if (block.type === "code") {
      const language = normalizeCodeLanguage(block.language);
      const label = getCodeLanguageLabel(block.language) || "Code";
      const code = block.lines.join("\n");

      return (
        <CodeBlock
          key={`code-${index}`}
          code={code}
          language={language}
          label={label}
          lines={block.lines}
        />
      );
    }

    if (block.type === "math") {
      return renderDisplayMath(block.lines.join("\n"), `math-${index}`);
    }

    return (
      <hr
        key={`rule-${index}`}
        className="max-w-3xl border-neutral-200 dark:border-neutral-800"
      />
    );
  });
}
