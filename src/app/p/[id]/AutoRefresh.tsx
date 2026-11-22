"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Refresca la página mientras hay una corrida en curso. */
export function AutoRefresh({ every = 4000 }: { every?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), every);
    return () => clearInterval(t);
  }, [router, every]);
  return null;
}
