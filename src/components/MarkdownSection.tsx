import { renderMarkdown } from "../utils/markdown";

type MarkdownSectionProps = {
  title: string;
  markdown: string;
  accent?: "sand" | "green";
};

function MarkdownSection({
  title,
  markdown,
  accent = "sand",
}: MarkdownSectionProps) {
  const toneClasses =
    accent === "green"
      ? "border-accent/20 bg-accent-soft/60"
      : "border-border/70 bg-white/70";

  return (
    <section
      className={`rounded-[24px] border p-6 shadow-[0_20px_60px_rgba(68,49,22,0.05)] ${toneClasses}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
        {title}
      </p>
      <div className="mt-4 space-y-4 text-[15px] leading-7 text-text-primary">
        {renderMarkdown(markdown)}
      </div>
    </section>
  );
}

export default MarkdownSection;
