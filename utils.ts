export function getWeddingTitle() {
  return process.env.NEXT_PUBLIC_WEDDING_TITLE ?? "Notre Mariage";
}

export function formatUploadDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function generatePhotoFilename(originalName?: string) {
  const ext = originalName?.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "heic"].includes(ext)
    ? ext
    : "jpg";
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${safeExt}`;
}
