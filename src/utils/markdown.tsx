import type { ReactNode } from "react";
import CodeBlock from "../components/CodeBlock";

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "code"; lines: string[]; language: string }
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

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
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
          renderCodeLine={renderCodeLine}
        />
      );
    }

    return (
      <hr
        key={`rule-${index}`}
        className="max-w-3xl border-neutral-200 dark:border-neutral-800"
      />
    );
  });
}
