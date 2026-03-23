import { useState, useEffect, memo } from "react";
import { getCachedImage, preCacheImages } from "@/services/ImageCacheService";
import stationPlaceholder from "@/assets/station-placeholder.png";

interface CachedImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

/**
 * Image component that checks IndexedDB cache first,
 * falls back to network URL directly, and defers caching to the background queue.
 */
export const CachedImage = memo(function CachedImage({
  src,
  alt,
  className = "",
  loading = "lazy",
}: CachedImageProps) {
  const [displaySrc, setDisplaySrc] = useState<string>(stationPlaceholder);

  useEffect(() => {
    if (!src) {
      setDisplaySrc(stationPlaceholder);
      return;
    }

    let revoke: string | null = null;

    getCachedImage(src).then((cached) => {
      if (cached) {
        revoke = cached;
        setDisplaySrc(cached);
      } else {
        // Show original URL directly — no inline fetch+cache storm
        setDisplaySrc(src);
        // Defer caching to background queue at low priority
        preCacheImages([src], 1);
      }
    });

    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [src]);

  const handleError = () => {
    setDisplaySrc(stationPlaceholder);
  };

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
    />
  );
});
