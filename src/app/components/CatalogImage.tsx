"use client";

import { useEffect, useState } from "react";

/** סיומות קצרות בלבד – WebP קודם, ואז PNG */
const IMAGE_EXTENSIONS = [".webp", ".png"] as const;

/** שבירת מטמון ישן אחרי עדכון התמונות */
const CACHE_BUST = "v2";

type CatalogImageProps = {
  itemId?: string;
  imageUrl?: string;
  name: string;
  /** תמונה ריבועית (ברירת מחדל) */
  square?: boolean;
  className?: string;
  priority?: boolean;
};

function withCacheBust(url: string): string {
  if (!url) return url;
  const join = url.includes("?") ? "&" : "?";
  return `${url}${join}${CACHE_BUST}`;
}

/**
 * טוען תמונת פריט עם העדפה ל-WebP הדחוס.
 * מטפל גם בתמונות ממטמון הדפדפן (שבהן onLoad לפעמים לא נורה).
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
  const rawSrc = imageUrl ?? (itemId ? `/images/items/${itemId}${ext}` : "");
  const src = rawSrc ? withCacheBust(rawSrc) : "";

  // איפוס מצב כשמשנים מקור
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  const markLoaded = () => setLoaded(true);

  const handleError = () => {
    if (imageUrl || !itemId) {
      setError(true);
      return;
    }
    if (extIndex < IMAGE_EXTENSIONS.length - 1) {
      setExtIndex((i) => i + 1);
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
        className={`relative z-[1] h-full w-full object-cover transition-opacity duration-150 ${loaded ? "opacity-100" : "opacity-0"}`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "low"}
        sizes="(max-width: 640px) 45vw, 180px"
        ref={(img) => {
          // תמונה ממטמון – onLoad כבר נורה לפני React
          if (img?.complete && img.naturalWidth > 0) {
            markLoaded();
          }
        }}
        onLoad={markLoaded}
        onError={handleError}
      />
    </div>
  );
}
