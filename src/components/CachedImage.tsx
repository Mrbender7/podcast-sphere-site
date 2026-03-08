import { useState, useEffect, memo } from "react";
import { getCachedImage, cacheImage } from "@/services/ImageCacheService";
import stationPlaceholder from "@/assets/station-placeholder.png";

interface CachedImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

/**
 * Image component that checks IndexedDB cache first,
 * falls back to network (and caches the result), then placeholder on error.
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
        // Show original while caching in background
        setDisplaySrc(src);
        cacheImage(src).then((objectUrl) => {
          if (objectUrl) {
            revoke = objectUrl;
            setDisplaySrc(objectUrl);
          }
        });
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
