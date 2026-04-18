import { TAGS, type HandbookTag } from "../data/types";

type TagFilterProps = {
  selectedTag: HandbookTag | "all";
  counts: Record<HandbookTag, number>;
  onSelect: (tag: HandbookTag | "all") => void;
};

function TagFilter({ selectedTag, counts, onSelect }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => onSelect("all")}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          selectedTag === "all"
            ? "bg-accent text-white"
            : "border border-border bg-white/70 text-text-primary hover:bg-panel/55"
        }`}
      >
        All topics
      </button>
      {TAGS.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelect(tag)}
          className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
            selectedTag === tag
              ? "bg-accent text-white"
              : "border border-border bg-white/70 text-text-primary hover:bg-panel/55"
          }`}
        >
          {tag} <span className="text-xs opacity-75">({counts[tag]})</span>
        </button>
      ))}
    </div>
  );
}

export default TagFilter;
