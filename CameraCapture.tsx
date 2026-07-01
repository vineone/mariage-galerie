"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createBrowserClient,
  isSupabaseConfigured,
  PHOTOS_BUCKET,
} from "@/lib/supabase";
import { generatePhotoFilename } from "@/lib/utils";

type PermissionState = "idle" | "requesting" | "granted" | "denied";
type UploadState = "idle" | "uploading" | "success" | "error";
type CaptureMode = "choose" | "camera" | "preview";

export function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<CaptureMode>("choose");
  const [permission, setPermission] = useState<PermissionState>("idle");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadCount, setUploadCount] = useState(0);
  const [canUseLiveCamera, setCanUseLiveCamera] = useState(true);

  useEffect(() => {
    setCanUseLiveCamera(window.isSecureContext);
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [stopCamera, previewUrl]);

  const resetPreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
    setUploadState("idle");
    setErrorMessage(null);
    setMode("choose");
    stopCamera();
  }, [previewUrl, stopCamera]);

  const showPreview = useCallback((file: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMode("preview");
    setUploadState("idle");
    setErrorMessage(null);
  }, [previewUrl]);

  const startCamera = async () => {
    if (!isSupabaseConfigured()) {
      setErrorMessage(
        "Supabase n'est pas configuré. Consultez le README pour la mise en place."
      );
      return;
    }

    setErrorMessage(null);
    setPermission("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setPermission("granted");
      setMode("camera");

      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch (err) {
      setPermission("denied");
      const message = !window.isSecureContext
        ? "La caméra en direct nécessite une connexion sécurisée (HTTPS). Utilisez « Ouvrir l'appareil photo » ci-dessous, ou attendez la version en ligne du site."
        : err instanceof DOMException && err.name === "NotAllowedError"
          ? "Accès à l'appareil photo refusé. Autorisez la caméra dans les réglages de votre navigateur, ou utilisez l'appareil photo natif."
          : "Impossible d'accéder à l'appareil photo. Utilisez « Ouvrir l'appareil photo » ou choisissez depuis la galerie.";
      setErrorMessage(message);
      setMode("choose");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        stopCamera();
        const file = new File([blob], generatePhotoFilename("photo.jpg"), {
          type: "image/jpeg",
        });
        showPreview(file);
      },
      "image/jpeg",
      0.92
    );
  };

  const handleGallerySelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const file = files[0];
    showPreview(file);
    event.target.value = "";
  };

  const uploadPhoto = async () => {
    if (!pendingFile) return;

    if (!isSupabaseConfigured()) {
      setErrorMessage("Supabase n'est pas configuré.");
      setUploadState("error");
      return;
    }

    setUploadState("uploading");
    setErrorMessage(null);

    try {
      const supabase = createBrowserClient();
      const filename = generatePhotoFilename(pendingFile.name);
      const path = `uploads/${filename}`;

      const { error } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .upload(path, pendingFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: pendingFile.type || "image/jpeg",
        });

      if (error) throw error;

      setUploadState("success");
      setUploadCount((c) => c + 1);
    } catch (err) {
      setUploadState("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'envoi. Réessayez."
      );
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {mode === "choose" && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-rose/20 bg-white/70 p-5 shadow-sm">
            <h2 className="font-serif text-xl text-ink">
              Partagez vos souvenirs
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Prenez une photo avec votre appareil ou choisissez-en une depuis
              votre galerie. Votre navigateur vous demandera l&apos;autorisation
              d&apos;accéder à la caméra ou aux photos.
            </p>
          </div>

          {!canUseLiveCamera && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              En test sur ordinateur, la caméra en direct ne fonctionne pas
              toujours. Une fois le site en ligne (HTTPS), elle marchera sur
              les téléphones des invités.
            </div>
          )}

          <label className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-rose px-6 py-4 text-base font-semibold text-white shadow-md transition hover:bg-rose-dark">
            <CameraIcon />
            Ouvrir l&apos;appareil photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleGallerySelect}
            />
          </label>

          {canUseLiveCamera && (
            <button
              type="button"
              onClick={() => void startCamera()}
              disabled={permission === "requesting"}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-rose/30 bg-white px-6 py-4 text-base font-semibold text-rose transition hover:border-rose/50 hover:bg-rose/5 disabled:opacity-60"
            >
              <CameraIcon />
              {permission === "requesting"
                ? "Demande d'autorisation..."
                : "Caméra en direct (aperçu)"}
            </button>
          )}

          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-rose/20 bg-white px-6 py-4 text-base font-semibold text-ink-muted transition hover:border-rose/30 hover:bg-rose/5"
          >
            <GalleryIcon />
            Choisir depuis la galerie
          </button>

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleGallerySelect}
          />
        </section>
      )}

      {mode === "camera" && (
        <section className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-black shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="aspect-[3/4] w-full object-cover"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetPreview}
              className="flex-1 rounded-2xl border border-rose/30 bg-white py-4 font-medium text-ink-muted"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              className="flex-[2] rounded-2xl bg-rose py-4 font-semibold text-white shadow-md"
            >
              Capturer
            </button>
          </div>
        </section>
      )}

      {mode === "preview" && previewUrl && (
        <section className="space-y-4">
          <div className="overflow-hidden rounded-2xl shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Aperçu de votre photo"
              className="aspect-[3/4] w-full object-cover"
            />
          </div>

          {uploadState === "success" ? (
            <div className="space-y-4 rounded-2xl border border-sage/30 bg-sage/10 p-5 text-center">
              <p className="font-serif text-lg text-ink">
                Merci ! Votre photo est dans la galerie.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={resetPreview}
                  className="rounded-2xl bg-rose py-4 font-semibold text-white"
                >
                  Envoyer une autre photo
                </button>
                <a
                  href="/galerie"
                  className="rounded-2xl border border-rose/30 py-4 font-medium text-rose"
                >
                  Voir la galerie
                </a>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetPreview}
                disabled={uploadState === "uploading"}
                className="flex-1 rounded-2xl border border-rose/30 bg-white py-4 font-medium text-ink-muted disabled:opacity-50"
              >
                Reprendre
              </button>
              <button
                type="button"
                onClick={() => void uploadPhoto()}
                disabled={uploadState === "uploading"}
                className="flex-[2] rounded-2xl bg-rose py-4 font-semibold text-white shadow-md disabled:opacity-60"
              >
                {uploadState === "uploading"
                  ? "Envoi en cours..."
                  : "Envoyer à la galerie"}
              </button>
            </div>
          )}
        </section>
      )}

      {errorMessage && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {uploadCount > 0 && uploadState !== "success" && (
        <p className="text-center text-xs text-ink-muted">
          {uploadCount} photo{uploadCount > 1 ? "s" : ""} envoyée
          {uploadCount > 1 ? "s" : ""} cette session
        </p>
      )}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-6 w-6"
      aria-hidden
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-6 w-6"
      aria-hidden
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}
