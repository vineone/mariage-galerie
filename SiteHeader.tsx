"use client";

import Link from "next/link";
import { getWeddingTitle } from "@/lib/utils";

export function SiteHeader({
  showBack = false,
  backHref = "/",
}: {
  showBack?: boolean;
  backHref?: string;
}) {
  const title = getWeddingTitle();

  return (
    <header className="sticky top-0 z-20 border-b border-rose/15 bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
        {showBack ? (
          <Link
            href={backHref}
            className="text-sm font-medium text-ink-muted transition hover:text-ink"
            aria-label="Retour"
          >
            ← Retour
          </Link>
        ) : (
          <span className="w-14" />
        )}
        <h1 className="font-serif text-lg tracking-wide text-ink">{title}</h1>
        <Link
          href="/galerie"
          className="text-sm font-medium text-rose transition hover:text-rose-dark"
        >
          Galerie
        </Link>
      </div>
    </header>
  );
}
