export function getTagTheme(tag: string) {
  const normalized = tag.toLowerCase().trim();
  switch (normalized) {
    case "aws":
      return {
        bg: "bg-amber-500/10 dark:bg-amber-400/15",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-500/20 dark:border-amber-400/20",
        gradient:
          "from-amber-500/10 to-orange-500/5 dark:from-amber-400/15 dark:to-orange-400/10",
      };
    case "linear algebra":
      return {
        bg: "bg-indigo-500/10 dark:bg-indigo-400/15",
        text: "text-indigo-600 dark:text-indigo-400",
        border: "border-indigo-500/20 dark:border-indigo-400/20",
        gradient:
          "from-indigo-500/10 to-purple-500/5 dark:from-indigo-400/15 dark:to-purple-400/10",
      };
    case "algorithms":
      return {
        bg: "bg-blue-500/10 dark:bg-blue-400/15",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-500/20 dark:border-blue-400/20",
        gradient:
          "from-blue-500/10 to-cyan-500/5 dark:from-blue-400/15 dark:to-cyan-400/10",
      };
    case "statistics":
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-400/15",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500/20 dark:border-emerald-400/20",
        gradient:
          "from-emerald-500/10 to-teal-500/5 dark:from-emerald-400/15 dark:to-teal-400/10",
      };
    case "security":
      return {
        bg: "bg-rose-500/10 dark:bg-rose-400/15",
        text: "text-rose-600 dark:text-rose-400",
        border: "border-rose-500/20 dark:border-rose-400/20",
        gradient:
          "from-rose-500/10 to-red-500/5 dark:from-rose-400/15 dark:to-red-400/10",
      };
    case "others":
      return {
        bg: "bg-purple-500/10 dark:bg-purple-400/15",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-500/20 dark:border-purple-400/20",
        gradient:
          "from-purple-500/10 to-pink-500/5 dark:from-purple-400/15 dark:to-pink-400/10",
      };
    default:
      return {
        bg: "bg-sky-500/10 dark:bg-sky-400/15",
        text: "text-sky-600 dark:text-sky-400",
        border: "border-sky-500/20 dark:border-sky-400/20",
        gradient:
          "from-sky-500/10 to-indigo-500/5 dark:from-sky-400/15 dark:to-indigo-400/10",
      };
  }
}
