"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createBrowserClient,
  isSupabaseConfigured,
  PHOTOS_BUCKET,
} from "@/lib/supabase";
import { formatUploadDate } from "@/lib/utils";

type PhotoItem = {
  name: string;
  url: string;
  createdAt: string;
};

export function PhotoGallery() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const loadPhotos = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setError(
        "Supabase n'est pas configuré. Ajoutez vos clés dans .env.local."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserClient();
      const { data, error: listError } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .list("uploads", {
          limit: 200,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (listError) throw listError;

      const items = (data ?? []).filter(
        (item) => item.name && !item.name.startsWith(".")
      );

      const withUrls: PhotoItem[] = items.map((item) => {
        const path = `uploads/${item.name}`;
        const { data: urlData } = supabase.storage
          .from(PHOTOS_BUCKET)
          .getPublicUrl(path);

        return {
          name: item.name,
          url: urlData.publicUrl,
          createdAt: item.created_at ?? new Date().toISOString(),
        };
      });

      setPhotos(withUrls);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de charger la galerie."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPhotos();
  }, [loadPhotos]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-ink-muted">
        <div className="mb-4 h-10 w-10 animate-pulse-soft rounded-full border-2 border-rose border-t-transparent" />
        <p>Chargement de la galerie...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => void loadPhotos()}
          className="mt-4 rounded-xl bg-rose px-4 py-2 text-sm font-medium text-white"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-2xl border border-rose/20 bg-white/70 p-8 text-center">
        <p className="font-serif text-xl text-ink">La galerie est vide</p>
        <p className="mt-2 text-sm text-ink-muted">
          Soyez les premiers à partager une photo !
        </p>
        <a
          href="/capture"
          className="mt-6 inline-block rounded-2xl bg-rose px-6 py-3 font-semibold text-white"
        >
          Prendre une photo
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          {photos.length} photo{photos.length > 1 ? "s" : ""}
        </p>
        <button
          type="button"
          onClick={() => void loadPhotos()}
          className="text-sm font-medium text-rose"
        >
          Actualiser
        </button>
      </div>

      <div className="columns-2 gap-3 space-y-3 sm:columns-3">
        {photos.map((photo) => (
          <button
            key={photo.name}
            type="button"
            onClick={() => setSelectedPhoto(photo)}
            className="group block w-full break-inside-avoid overflow-hidden rounded-xl shadow-sm transition hover:shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={`Photo ${photo.name}`}
              loading="lazy"
              className="w-full object-cover transition group-hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setSelectedPhoto(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo agrandie"
        >
          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-sm text-white"
          >
            Fermer
          </button>
          <div
            className="max-h-[85dvh] max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhoto.url}
              alt={`Photo ${selectedPhoto.name}`}
              className="max-h-[75dvh] w-full rounded-lg object-contain"
            />
            <p className="mt-3 text-center text-sm text-white/70">
              {formatUploadDate(selectedPhoto.createdAt)}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
