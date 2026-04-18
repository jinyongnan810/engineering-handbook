import type { ReactNode } from "react";
import { isLocalhost } from "../utils/hostname";

type LocalOnlyProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

function LocalOnly({ children, fallback = null }: LocalOnlyProps) {
  return isLocalhost() ? <>{children}</> : <>{fallback}</>;
}

export default LocalOnly;
