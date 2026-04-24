import type { ReactNode } from "react";

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "code"; lines: string[] }
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
      index += 1;
      const codeLines: string[] = [];
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push({ type: "code", lines: codeLines });
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
          className="rounded bg-neutral-100 px-1.5 py-0.5 text-[0.92em]"
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
            className="font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-950"
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
            className="scroll-mt-24 text-5xl font-semibold tracking-tight text-balance sm:text-6xl"
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
            className="scroll-mt-24 pt-6 text-3xl font-semibold tracking-tight text-balance"
          >
            {renderInline(block.text)}
          </h2>
        );
      }

      return (
        <h3
          key={`heading-${index}`}
          id={id}
          className="scroll-mt-24 pt-3 text-xl font-semibold tracking-tight text-balance"
        >
          {renderInline(block.text)}
        </h3>
      );
    }

    if (block.type === "paragraph") {
      return (
        <p
          key={`paragraph-${index}`}
          className="max-w-3xl text-[17px] leading-8 text-neutral-800"
        >
          {renderInline(block.text)}
        </p>
      );
    }

    if (block.type === "unordered-list") {
      return (
        <ul
          key={`unordered-${index}`}
          className="max-w-3xl list-disc space-y-2 pl-6 text-[17px] leading-8 text-neutral-800"
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
          className="max-w-3xl list-decimal space-y-2 pl-6 text-[17px] leading-8 text-neutral-800"
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
          className="max-w-3xl border-l border-neutral-300 pl-4 italic text-neutral-700"
        >
          {block.lines.map((line, lineIndex) => (
            <p key={`blockquote-${index}-${lineIndex}`}>{renderInline(line)}</p>
          ))}
        </blockquote>
      );
    }

    if (block.type === "code") {
      return (
        <pre
          key={`code-${index}`}
          className="max-w-3xl overflow-x-auto rounded-lg bg-neutral-950 px-4 py-4 text-sm leading-7 text-neutral-50"
        >
          <code>{block.lines.join("\n")}</code>
        </pre>
      );
    }

    return (
      <hr key={`rule-${index}`} className="max-w-3xl border-neutral-200" />
    );
  });
}
