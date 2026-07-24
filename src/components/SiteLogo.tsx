import React from "react";

interface SiteLogoProps {
  className?: string;
  size?: number;
}

export const SiteLogo: React.FC<SiteLogoProps> = ({
  className = "",
  size = 28,
}) => {
  return (
    <img
      src="/favicon.svg"
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      // dark:invert tells Tailwind to invert the colors of the image when in dark mode
      className={`shrink-0 transition-transform duration-200 hover:scale-105 dark:invert ${className}`}
      aria-hidden="true"
    />
  );
};
