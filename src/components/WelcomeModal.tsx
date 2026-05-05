import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import podcastSphereLogo from "@/assets/podcast-sphere-logo-new.png";
import { Globe, Radio, Heart, Search, Music, ChevronRight, ShieldCheck } from "lucide-react";
import { requestAllPermissions } from "@/utils/permissions";
import type { Language } from "@/i18n/translations";
import { LANGUAGE_OPTIONS } from "@/i18n/translations";
import translations from "@/i18n/translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlagIcon } from "@/components/FlagIcon";

interface WelcomeModalProps {
  open: boolean;
  onComplete: (lang: Language) => void;
}

const FEATURE_ICONS = [Radio, Search, Heart, Music] as const;
const FEATURE_KEYS = ["welcome.stations", "welcome.search", "welcome.favExport", "welcome.genres"] as const;

export function WelcomeModal({ open, onComplete }: WelcomeModalProps) {
  const [selectedLang, setSelectedLang] = useState<Language>("fr");
  const t = (key: string) => translations[selectedLang][key] ?? key;

  const handleContinue = async () => {
    await requestAllPermissions();
    onComplete(selectedLang);
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden rounded-2xl border-border bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/20 [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Podcast Sphere</DialogTitle>
        <DialogDescription className="sr-only">{t("welcome.subtitle")}</DialogDescription>

        <div className="flex flex-col items-center px-6 py-8 text-center max-h-[90vh] overflow-y-auto">
          {/* Logo */}
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-3xl scale-150 animate-pulse" />
            <img
              src={podcastSphereLogo}
              alt="Podcast Sphere"
              className="w-24 h-24 rounded-2xl relative z-10 mix-blend-screen animate-logo-glow"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent mb-2 drop-shadow-[0_0_16px_hsla(250,80%,60%,0.4)]">
            Podcast Sphere
          </h1>
          <p className="text-sm text-muted-foreground mb-2">
            {t("welcome.subtitle")}
          </p>
          <a
            href="https://radiosphere.be"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary transition-colors mb-4 inline-block"
          >
            Un produit de{" "}
            <span className="underline underline-offset-2">radiosphere.be</span>
          </a>

          {/* Google Play badge */}
          <a
            href="https://play.google.com/store/apps/details?id=be.radiosphere.podcastsphere"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Get it on Google Play"
            className="mb-6 inline-block transition-transform hover:scale-105"
          >
            <img
              src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
              alt="Get it on Google Play"
              className="h-20 w-auto"
              loading="lazy"
            />
          </a>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-2.5 w-full max-w-xs mb-6">
            {FEATURE_KEYS.map((key, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div
                  key={key}
                  className="flex items-center gap-2.5 rounded-xl bg-accent/80 border border-border/50 p-2.5"
                >
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-medium text-foreground text-left leading-tight">
                    {t(key)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Language selector */}
          <div className="w-full max-w-xs mb-5">
            <div className="flex items-center justify-center gap-2 mb-2.5">
              <Globe className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                {t("welcome.chooseLanguage")}
              </p>
            </div>
            <Select value={selectedLang} onValueChange={(v) => setSelectedLang(v as Language)}>
              <SelectTrigger className="w-full rounded-xl bg-secondary text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="inline-flex items-center gap-2">
                      <FlagIcon lang={opt.value} className="w-5 h-3.5" />
                      {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Continue button */}
          <button
            onClick={handleContinue}
            className="w-full max-w-xs py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[hsl(220,90%,56%)] to-[hsl(280,80%,56%)] text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {t("welcome.start")}
            <ChevronRight className="w-4 h-4" />
          </button>

          <a
            href="https://radiosphere.be/privacy-policy-podcastsphere.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:underline mt-4"
          >
            <ShieldCheck className="w-3 h-3" />
            {t("settings.privacyPolicy")}
          </a>

          <p className="text-[10px] text-muted-foreground mt-2 opacity-60">Podcast Sphere v1.0</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
