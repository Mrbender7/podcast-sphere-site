import { useEffect, useState } from "react";
import { ExternalLink, X } from "lucide-react";

const STORAGE_KEY = "podcastsphere_inapp_dismissed";

/**
 * Détecte les WebViews in-app (Facebook, Instagram, Messenger, TikTok, LinkedIn, Snapchat)
 * où certaines fonctionnalités (audio en arrière-plan, MediaSession, persistance)
 * peuvent être limitées. Suggère d'ouvrir dans le navigateur natif.
 */
function detectInAppBrowser(): string | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";

  if (/FBAN|FBAV|FB_IAB|FB4A|FBIOS/i.test(ua)) return "Facebook";
  if (/Instagram/i.test(ua)) return "Instagram";
  if (/Messenger/i.test(ua) || /MessengerLite/i.test(ua)) return "Messenger";
  if (/TikTok|musical_ly|Bytedance/i.test(ua)) return "TikTok";
  if (/LinkedInApp/i.test(ua)) return "LinkedIn";
  if (/Snapchat/i.test(ua)) return "Snapchat";
  return null;
}

export function InAppBrowserBanner() {
  const [browser, setBrowser] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "true") {
        setDismissed(true);
        return;
      }
    } catch {}
    setBrowser(detectInAppBrowser());
  }, []);

  if (!browser || dismissed) return null;

  const handleOpenExternal = () => {
    const url = window.location.href;
    // iOS Safari: x-safari-https:// — Android: intent://
    const ua = navigator.userAgent || "";
    if (/Android/i.test(ua)) {
      const cleanUrl = url.replace(/^https?:\/\//, "");
      window.location.href = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    } else {
      // iOS — pas de moyen fiable, on copie l'URL et on invite à coller
      try {
        navigator.clipboard?.writeText(url);
      } catch {}
      window.location.href = url;
    }
  };

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    setDismissed(true);
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-[hsl(220,90%,56%)] to-[hsl(280,80%,56%)] text-white px-3 py-2 shadow-lg"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.5rem)" }}
    >
      <div className="flex items-center gap-2 max-w-3xl mx-auto">
        <ExternalLink className="w-4 h-4 shrink-0" />
        <p className="text-xs flex-1 leading-tight">
          Pour une meilleure expérience (lecture en arrière-plan), ouvrez Podcast Sphere dans votre navigateur via le menu <strong>{browser}</strong> ⋮.
        </p>
        <button
          onClick={handleOpenExternal}
          className="text-xs font-semibold underline underline-offset-2 whitespace-nowrap hover:opacity-90"
          type="button"
        >
          Ouvrir
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          type="button"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
