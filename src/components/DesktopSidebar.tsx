import { useState } from "react";
import { Home, Search, Bookmark, Settings, Mail, ShieldCheck, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";
import { LANGUAGE_OPTIONS } from "@/i18n/translations";
import { FlagIcon } from "@/components/FlagIcon";
import type { TabId } from "@/components/BottomNav";
import podcastSphereLogo from "@/assets/podcast-sphere-logo-new.png";
import radiosphereIcon from "@/assets/radiosphere-icon.png";

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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      role="navigation"
      aria-label="Navigation"
      className={cn(
        "hidden lg:flex flex-col h-full bg-sidebar border-r border-sidebar-border flex-shrink-0 relative overflow-hidden transition-[width] duration-300 ease-in-out",
        collapsed ? "w-14" : "w-72"
      )}
    >
      {/* Toggle button */}
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-4 mb-4 w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          title="Ouvrir la sidebar"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={() => setCollapsed(true)}
          className="absolute top-1/2 -translate-y-1/2 -right-0 z-10 w-7 h-7 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors shadow-sm"
          title="Replier la sidebar"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Collapsed view */}
      <div className={cn(
        "flex flex-col items-center transition-opacity duration-200",
        collapsed ? "opacity-100" : "opacity-0 absolute pointer-events-none"
      )}>
        <img
          src={podcastSphereLogo}
          alt="Podcast Sphere"
          className="w-9 h-9 rounded-xl mix-blend-screen mb-4"
        />
        <nav className="space-y-1 w-full px-1.5">
          {navItems.map(({ id, labelKey, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                "w-full flex items-center justify-center py-3 rounded-xl transition-all",
                activeTab === id
                  ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.3)]"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
              title={t(labelKey)}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </nav>
      </div>

      {/* Expanded view */}
      <div className={cn(
        "flex flex-col flex-1 min-w-[18rem] transition-opacity duration-200",
        collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 pt-8 pb-6">
          <img
            src={podcastSphereLogo}
            alt="Podcast Sphere"
            className="w-11 h-11 rounded-xl mix-blend-screen"
          />
          <h1 className="text-xl font-heading font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(280,80%,60%)] bg-clip-text text-transparent whitespace-nowrap">
            Podcast Sphere
          </h1>
        </div>

        {/* Description */}
        <div className="px-5 pb-4">
          <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-nowrap">
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
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
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

        {/* Bottom section */}
        <div className="px-4 pb-6 pt-4 space-y-3">
          <a
            href="https://radiosphere.be"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-sidebar-accent/60 hover:bg-sidebar-accent border border-sidebar-border/50 transition-colors group"
          >
            <img
              src={radiosphereIcon}
              alt="RadioSphere.be"
              className="w-11 h-11 rounded-lg flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-base font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(280,80%,60%)] bg-clip-text text-transparent whitespace-nowrap">RadioSphere.be</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-muted-foreground"><path d="M4.5 2A2.5 2.5 0 0 0 2 4.5v7A2.5 2.5 0 0 0 4.5 14h7a2.5 2.5 0 0 0 2.5-2.5v-3a.75.75 0 0 1 1.5 0v3A4 4 0 0 1 11.5 15.5h-7A4 4 0 0 1 .5 11.5v-7A4 4 0 0 1 4.5.5h3a.75.75 0 0 1 0 1.5h-3ZM9 .75A.75.75 0 0 1 9.75 0h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V2.56l-4.72 4.72a.75.75 0 0 1-1.06-1.06L13.44 1.5H9.75A.75.75 0 0 1 9 .75Z"/></svg>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{t("sidebar.radioDescription") || "Écoutez la radio en direct"}</p>
            </div>
          </a>
          <a
            href="mailto:info@radiosphere.be"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-muted-foreground hover:text-primary hover:bg-sidebar-accent transition-colors whitespace-nowrap"
          >
            <Mail className="w-4 h-4" />
            info@radiosphere.be
          </a>
          <a
            href="https://radiosphere.be/privacy-policy-podcastsphere.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-primary hover:bg-sidebar-accent transition-colors whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {t("settings.privacyPolicy")}
          </a>
          <div className="flex items-center gap-3 px-4">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLanguage(opt.value)}
                className={cn(
                  "transition-all",
                  language === opt.value
                    ? "scale-125 drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
                    : "opacity-50 hover:opacity-100 hover:scale-110 grayscale hover:grayscale-0"
                )}
                title={opt.label}
              >
                <FlagIcon lang={opt.value} className="w-7 h-5" />
              </button>
            ))}
          </div>
          <p className="px-4 text-[10px] text-muted-foreground leading-relaxed whitespace-nowrap">
            © {new Date().getFullYear()} Podcast Sphere — {t("footer.createdBy")}
          </p>
          <p className="px-4 text-[10px] text-muted-foreground leading-relaxed whitespace-nowrap">
            {t("footer.poweredBy")}
          </p>
        </div>
      </div>

      {/* Collapsed bottom: language flags */}
      {collapsed && (
        <div className="mt-auto flex flex-col items-center gap-2 pb-6">
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setLanguage(opt.value)}
              className={cn(
                "transition-all",
                language === opt.value
                  ? "scale-110 drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
                  : "opacity-50 hover:opacity-100 hover:scale-105 grayscale hover:grayscale-0"
              )}
              title={opt.label}
            >
              <FlagIcon lang={opt.value} className="w-6 h-4" />
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
