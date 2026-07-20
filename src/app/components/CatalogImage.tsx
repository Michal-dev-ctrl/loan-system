"use client";

import { useState } from "react";

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
 */
export function CatalogImage({
  itemId,
  imageUrl,
  name,
  square = true,
  className = "",
  priority = false,
}: CatalogImageProps) {
  const [failedExts, setFailedExts] = useState(0);
  const [broken, setBroken] = useState(false);

  const ext = imageUrl ? "" : IMAGE_EXTENSIONS[Math.min(failedExts, IMAGE_EXTENSIONS.length - 1)];
  const rawSrc = imageUrl ?? (itemId ? `/images/items/${itemId}${ext}` : "");
  const src = rawSrc ? withCacheBust(rawSrc) : "";

  const handleError = () => {
    if (imageUrl || !itemId) {
      setBroken(true);
      return;
    }
    if (failedExts < IMAGE_EXTENSIONS.length - 1) {
      setFailedExts((n) => n + 1);
    } else {
      setBroken(true);
    }
  };

  if (broken || !src) {
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={src}
        src={src}
        alt={name}
        width={400}
        height={400}
        className="h-full w-full object-cover bg-zinc-100"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "low"}
        sizes="(max-width: 640px) 45vw, 180px"
        onError={handleError}
      />
    </div>
  );
}
