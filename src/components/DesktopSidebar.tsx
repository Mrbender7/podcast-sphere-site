import { Home, Search, Bookmark, Settings, Mail, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";
import { LANGUAGE_OPTIONS } from "@/i18n/translations";
import type { TabId } from "@/components/BottomNav";
import podcastSphereLogo from "@/assets/podcast-sphere-logo-new.png";

const navItems = [
  { id: "home" as TabId, labelKey: "nav.home", icon: Home },
  { id: "search" as TabId, labelKey: "nav.search", icon: Search },
  { id: "library" as TabId, labelKey: "nav.library", icon: Bookmark },
  { id: "settings" as TabId, labelKey: "nav.settings", icon: Settings },
];

interface DesktopSidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function DesktopSidebar({ activeTab, onTabChange }: DesktopSidebarProps) {
  const { t, language, setLanguage } = useTranslation();

  return (
    <aside
      role="navigation"
      aria-label="Navigation"
      className="hidden lg:flex flex-col w-72 h-full bg-sidebar border-r border-sidebar-border flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 pt-8 pb-6">
        <img
          src={podcastSphereLogo}
          alt="Podcast Sphere"
          className="w-11 h-11 rounded-xl mix-blend-screen"
        />
        <h1 className="text-xl font-heading font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(280,80%,60%)] bg-clip-text text-transparent">
          Podcast Sphere
        </h1>
      </div>

      {/* Description */}
      <div className="px-5 pb-4">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {t("sidebar.description")}
        </p>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-1">
        {navItems.map(({ id, labelKey, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTab === id
                ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.3)] shadow-[0_0_12px_-3px_hsl(var(--primary)/0.25)]"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            <Icon className="w-5 h-5" />
            {t(labelKey)}
          </button>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom: Podcast Sphere link, contact, language, copyright */}
      <div className="px-4 pb-6 pt-4 space-y-3">
        <a
          href="https://radiosphere.be"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-muted-foreground hover:text-primary hover:bg-sidebar-accent transition-colors"
        >
          🌐 radiosphere.be
        </a>
        <a
          href="mailto:info@radiosphere.be"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-muted-foreground hover:text-primary hover:bg-sidebar-accent transition-colors"
        >
          <Mail className="w-4 h-4" />
          info@radiosphere.be
        </a>
        <a
          href="https://radiosphere.be/privacy-policy-podcastsphere.html"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-primary hover:bg-sidebar-accent transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          {t("settings.privacyPolicy")}
        </a>
        <div className="flex items-center gap-2 px-4">
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setLanguage(opt.value)}
              className={cn(
                "transition-all text-lg",
                language === opt.value
                  ? "scale-125 drop-shadow-[0_0_4px_hsl(var(--primary)/0.5)]"
                  : "opacity-50 hover:opacity-100 hover:scale-110 grayscale hover:grayscale-0"
              )}
              title={opt.label}
            >
              {opt.flag}
            </button>
          ))}
        </div>
        <p className="px-4 text-[10px] text-muted-foreground leading-relaxed">
          © {new Date().getFullYear()} Podcast Sphere — {t("footer.createdBy")}
        </p>
        <p className="px-4 text-[10px] text-muted-foreground leading-relaxed">
          {t("footer.poweredBy")}
        </p>
      </div>
    </aside>
  );
}
