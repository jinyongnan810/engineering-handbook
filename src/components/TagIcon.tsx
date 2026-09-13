type TagIconProps = {
  tag: string;
  className?: string;
};

export function TagIcon({ tag, className = "size-6" }: TagIconProps) {
  const normalized = tag.toLowerCase().trim();

  switch (normalized) {
    case "published work":
    case "公開作品":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <path d="M2 7h20" />
          <circle cx="5" cy="5" r="0.5" fill="currentColor" />
          <circle cx="7" cy="5" r="0.5" fill="currentColor" />
          <circle cx="9" cy="5" r="0.5" fill="currentColor" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      );

    case "robotics":
    case "ロボティクス":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
          <line x1="8" y1="16" x2="8" y2="16" />
          <line x1="16" y1="16" x2="16" y2="16" />
        </svg>
      );

    case "aws":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
      );

    case "linear algebra":
    case "線形代数":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 9h18" />
          <path d="M3 15h18" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
        </svg>
      );

    case "algorithms":
    case "アルゴリズム":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <rect width="16" height="16" x="4" y="4" rx="2" />
          <rect width="6" height="6" x="9" y="9" rx="1" />
          <path d="M15 2v2" />
          <path d="M15 20v2" />
          <path d="M2 15h2" />
          <path d="M2 9h2" />
          <path d="M20 15h2" />
          <path d="M20 9h2" />
          <path d="M9 2v2" />
          <path d="M9 20v2" />
        </svg>
      );

    case "statistics":
    case "統計学":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M3 3v18h18" />
          <path d="M18 17V9" />
          <path d="M13 17V5" />
          <path d="M8 17v-3" />
        </svg>
      );

    case "security":
    case "セキュリティ":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "artificial intelligence":
    case "人工知能":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="6" cy="18" r="2.5" />
          <circle cx="18" cy="6" r="2.5" />
          <circle cx="18" cy="18" r="2.5" />
          <circle cx="12" cy="12" r="2.5" />
          <line x1="8.2" y1="7.5" x2="9.8" y2="10.5" />
          <line x1="8.2" y1="16.5" x2="9.8" y2="13.5" />
          <line x1="14.2" y1="10.5" x2="15.8" y2="7.5" />
          <line x1="14.2" y1="13.5" x2="15.8" y2="16.5" />
        </svg>
      );

    case "physics":
    case "物理":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z" />
          <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z" />
        </svg>
      );

    case "others":
    case "その他":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
          <path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L3.18 12.5" />
          <path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L3.18 17.5" />
        </svg>
      );

    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l5.58-5.58c.94-.94.94-2.48 0-3.42L12 2Z" />
          <circle cx="7" cy="7" r="1.5" fill="currentColor" />
        </svg>
      );
  }
}
