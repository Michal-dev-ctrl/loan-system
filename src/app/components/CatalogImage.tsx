"use client";

import { useState } from "react";

const IMAGE_EXTENSIONS = [".webp", ".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"] as const;

type CatalogImageProps = {
  itemId?: string;
  imageUrl?: string;
  name: string;
  /** תמונה ריבועית (ברירת מחדל) */
  square?: boolean;
  className?: string;
  priority?: boolean;
};

/**
 * טוען תמונת פריט עם העדפה ל-WebP הדחוס, בלי לנסות עשרות סיומות מיותרות.
 */
export function CatalogImage({
  itemId,
  imageUrl,
  name,
  square = true,
  className = "",
  priority = false,
}: CatalogImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [extIndex, setExtIndex] = useState(0);

  const ext = imageUrl ? "" : IMAGE_EXTENSIONS[extIndex];
  const src = imageUrl ?? (itemId ? `/images/items/${itemId}${ext}` : "");

  const handleError = () => {
    if (imageUrl || !itemId) {
      setError(true);
      return;
    }
    if (extIndex < IMAGE_EXTENSIONS.length - 1) {
      setExtIndex((i) => i + 1);
      setLoaded(false);
    } else {
      setError(true);
    }
  };

  if (error || !src) {
    return (
      <div
        className={`flex w-full items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 text-xs ${square ? "aspect-square" : "h-20"} ${className}`}
        aria-hidden
      >
        אין תמונה
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-zinc-100 ${square ? "aspect-square" : "h-20"} ${className}`}
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-zinc-200" aria-hidden />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={src}
        src={src}
        alt={name}
        width={400}
        height={400}
        className={`h-full w-full object-cover transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "low"}
        sizes="(max-width: 640px) 50vw, 200px"
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
    </div>
  );
}
