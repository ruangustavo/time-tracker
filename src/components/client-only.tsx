"use client";

import { useIsClient } from "@uidotdev/usehooks";
import type { ReactNode } from "react";

export function ClientOnly({ children }: { children: ReactNode }) {
  const isClient = useIsClient();
  return isClient ? <>{children}</> : null;
}
