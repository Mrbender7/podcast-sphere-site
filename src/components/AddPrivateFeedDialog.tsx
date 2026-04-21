import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/contexts/LanguageContext";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { fetchPrivateFeed } from "@/services/PrivateFeedService";

interface AddPrivateFeedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPrivateFeedDialog({ open, onOpenChange }: AddPrivateFeedDialogProps) {
  const { t } = useTranslation();
  const { toggleSubscription, isSubscribed } = useFavoritesContext();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const isWeb = !Capacitor.isNativePlatform();

  const handleAdd = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    // Basic URL validation
    try {
      const parsed = new URL(trimmed);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        toast.error(t("privateFeed.invalidUrl"));
        return;
      }
    } catch {
      toast.error(t("privateFeed.invalidUrl"));
      return;
    }

    setLoading(true);
    try {
      const parsed = await fetchPrivateFeed(trimmed);
      if (!isSubscribed(parsed.podcast.id)) {
        toggleSubscription(parsed.podcast);
      }
      toast.success(`${t("privateFeed.added")} — ${parsed.podcast.title}`);
      setUrl("");
      onOpenChange(false);
    } catch (err: any) {
      const isCorsLikely = isWeb && (err?.message?.includes("Failed to fetch") || err?.name === "TypeError");
      if (isCorsLikely) {
        toast.error(t("privateFeed.webBlocked"), { duration: 6000 });
      } else {
        toast.error(t("privateFeed.fetchError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-heading font-bold bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent">
            <Lock className="w-5 h-5 text-[hsl(280,80%,60%)]" />
            {t("privateFeed.title")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("privateFeed.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-accent/50 border border-border">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("privateFeed.privacyNote")}
            </p>
          </div>

          <div>
            <label htmlFor="private-feed-url" className="text-xs font-semibold text-foreground mb-1.5 block">
              {t("privateFeed.urlLabel")}
            </label>
            <Input
              id="private-feed-url"
              type="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) handleAdd();
              }}
            />
          </div>

          {isWeb && (
            <p className="text-[11px] text-amber-500 leading-relaxed">
              ⚠️ {t("privateFeed.webWarning")}
            </p>
          )}

          <button
            onClick={handleAdd}
            disabled={loading || !url.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {loading ? t("privateFeed.adding") : t("privateFeed.add")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
