import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getWeddingTitle } from "@/lib/utils";

export default function HomePage() {
  const title = getWeddingTitle();

  return (
    <div className="min-h-dvh">
      <SiteHeader />

      <main className="mx-auto max-w-lg px-4 pb-12 pt-8">
        <section className="animate-fade-in text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-sage">
            Bienvenue
          </p>
          <h2 className="mt-3 font-serif text-4xl leading-tight text-ink">
            {title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            Vous avez scanné le QR code — merci de faire partie de notre
            journée ! Partagez vos plus belles photos pour qu&apos;on puisse
            toutes les revoir ensemble.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <Link
            href="/capture"
            className="flex items-center justify-center gap-3 rounded-2xl bg-rose px-6 py-5 text-lg font-semibold text-white shadow-lg transition hover:bg-rose-dark"
          >
            <span aria-hidden>📸</span>
            Partager une photo
          </Link>

          <Link
            href="/galerie"
            className="flex items-center justify-center gap-3 rounded-2xl border-2 border-rose/25 bg-white/80 px-6 py-5 text-lg font-semibold text-rose transition hover:border-rose/40 hover:bg-white"
          >
            <span aria-hidden>🖼️</span>
            Voir la galerie
          </Link>
        </section>

        <section className="mt-12 rounded-2xl border border-rose/15 bg-white/60 p-5">
          <h3 className="font-serif text-lg text-ink">Comment ça marche ?</h3>
          <ol className="mt-4 space-y-3 text-sm text-ink-muted">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose/15 text-xs font-bold text-rose">
                1
              </span>
              Appuyez sur « Partager une photo »
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose/15 text-xs font-bold text-rose">
                2
              </span>
              Autorisez l&apos;accès à la caméra ou à vos photos
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose/15 text-xs font-bold text-rose">
                3
              </span>
              Prenez ou choisissez une photo — elle apparaît dans la galerie
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}
