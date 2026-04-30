import { jsxs, jsx } from "react/jsx-runtime";
import { u as useTranslation, D as Dialog, q as DialogTrigger, d as DialogContent, e as DialogHeader, f as DialogTitle, c as cn, t as requestAllPermissions, v as useSleepTimer, b as useFavoritesContext, w as Select, x as SelectTrigger, y as SelectValue, z as SelectContent, L as LANGUAGE_OPTIONS, A as SelectItem, F as FlagIcon, B as SLEEP_TIMER_OPTIONS, E as Button, G as toast, H as AlertDialog, I as AlertDialogTrigger, J as AlertDialogContent, K as AlertDialogHeader, O as AlertDialogTitle, Q as AlertDialogDescription, R as AlertDialogFooter, T as AlertDialogCancel, U as AlertDialogAction } from "../main.mjs";
import { BookOpen, ChevronDown, RefreshCw, Home, Search, Bookmark, Lock, Settings, ShieldAlert, Moon, TimerOff, Heart, Download, Upload, Info, Wifi, Database, ExternalLink, Globe, Sparkles, Trash2, ShieldCheck } from "lucide-react";
import { useState, useRef } from "react";
import { I as Input } from "./input-6XZgwDxx.js";
import "vite-react-ssg";
import "react-helmet-async";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "next-themes";
import "sonner";
import "@radix-ui/react-tooltip";
import "@tanstack/react-query";
import "@capacitor/core";
import "@radix-ui/react-slider";
import "@radix-ui/react-popover";
import "@radix-ui/react-select";
import "@radix-ui/react-checkbox";
import "@radix-ui/react-slot";
import "@radix-ui/react-dialog";
import "@radix-ui/react-alert-dialog";
import "react-router-dom";
const SECTIONS = [
  { id: "home", icon: Home, titleKey: "guide.home", contentKey: "guide.homeContent" },
  { id: "search", icon: Search, titleKey: "guide.search", contentKey: "guide.searchContent" },
  { id: "favorites", icon: Bookmark, titleKey: "guide.favorites", contentKey: "guide.favoritesContent" },
  { id: "premium", icon: Lock, titleKey: "guide.premium", contentKey: "guide.premiumContent" },
  { id: "settings", icon: Settings, titleKey: "guide.settings", contentKey: "guide.settingsContent" },
  { id: "permissions", icon: ShieldAlert, titleKey: "guide.permissions", contentKey: "guide.permissionsContent" }
];
function UserGuideModal({ onReopenWelcome }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const toggle = (id) => setOpenSection((prev) => prev === id ? null : id);
  const handleReRequestPermissions = async () => {
    await requestAllPermissions();
  };
  return /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs("button", { className: "w-full rounded-xl bg-accent p-4 mb-4 flex items-center gap-3 text-left transition-all hover:bg-accent/80", children: [
      /* @__PURE__ */ jsx(BookOpen, { className: "w-5 h-5 text-primary shrink-0" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-foreground", children: t("guide.button") }),
      /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4 text-muted-foreground ml-auto -rotate-90" })
    ] }) }),
    /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-md max-h-[80vh] overflow-y-auto rounded-2xl bg-background border-border", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { className: "text-lg font-heading font-bold bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent", children: t("guide.title") }) }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2 mt-2", children: SECTIONS.map(({ id, icon: Icon, titleKey, contentKey }) => {
        const isOpen = openSection === id;
        const isPermissions = id === "permissions";
        return /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-accent overflow-hidden", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => toggle(id),
              className: "w-full flex items-center gap-3 p-3.5 text-left",
              type: "button",
              children: [
                /* @__PURE__ */ jsx(Icon, { className: "w-4.5 h-4.5 text-primary shrink-0" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-foreground flex-1", children: t(titleKey) }),
                /* @__PURE__ */ jsx(
                  ChevronDown,
                  {
                    className: cn(
                      "w-4 h-4 text-muted-foreground transition-transform duration-300",
                      isOpen && "rotate-180"
                    )
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: cn(
                "transition-all duration-300 ease-in-out",
                isOpen ? "max-h-[600px] opacity-100 overflow-y-auto" : "max-h-0 opacity-0 overflow-hidden"
              ),
              children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed px-3.5 pb-2 whitespace-pre-line", children: t(contentKey) }),
                isPermissions && isOpen && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 px-3.5 pb-3.5", children: [
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: handleReRequestPermissions,
                      className: "flex items-center gap-2 text-xs font-medium text-primary hover:underline",
                      type: "button",
                      children: [
                        /* @__PURE__ */ jsx(RefreshCw, { className: "w-3.5 h-3.5" }),
                        t("guide.permissionsReRequest")
                      ]
                    }
                  ),
                  onReopenWelcome && /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => {
                        setOpen(false);
                        onReopenWelcome();
                      },
                      className: "flex items-center gap-2 text-xs font-medium text-primary hover:underline",
                      type: "button",
                      children: [
                        /* @__PURE__ */ jsx(Home, { className: "w-3.5 h-3.5" }),
                        t("guide.permissionsReopenWelcome")
                      ]
                    }
                  )
                ] }),
                !isPermissions && /* @__PURE__ */ jsx("div", { className: "pb-1.5" })
              ]
            }
          )
        ] }, id);
      }) })
    ] })
  ] });
}
function CollapsibleSection({ icon: Icon, title, badge, children }) {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "w-full rounded-xl bg-accent p-4 mb-4 text-left transition-all", children: [
    /* @__PURE__ */ jsxs("button", { onClick: () => setOpen((o) => !o), className: "w-full flex items-center gap-2", type: "button", children: [
      /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5 text-amber-400" }),
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground", children: title }),
      badge && /* @__PURE__ */ jsx("span", { className: "ml-auto", children: badge }),
      /* @__PURE__ */ jsx(ChevronDown, { className: cn("w-4 h-4 text-muted-foreground transition-transform duration-300 ml-auto", open && "rotate-180") })
    ] }),
    /* @__PURE__ */ jsx("div", { className: cn("overflow-hidden transition-all duration-300 ease-in-out", open ? "max-h-[500px] opacity-100 mt-3" : "max-h-0 opacity-0"), children })
  ] });
}
function SettingsPage({ onReopenWelcome, onResetApp }) {
  const { language, setLanguage, t } = useTranslation();
  const { isActive, formattedTime, startTimer, cancelTimer } = useSleepTimer();
  const { subscriptions, importSubscriptions } = useFavoritesContext();
  const fileInputRef = useRef(null);
  const [customMinutes, setCustomMinutes] = useState("");
  return /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto px-4 pb-4 flex flex-col", children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto w-full flex-1 flex flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-6 mb-6", children: [
      /* @__PURE__ */ jsx(Settings, { className: "w-6 h-6 text-[hsl(280,80%,60%)]" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-heading font-bold bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent", children: t("nav.settings") })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-accent p-4 mb-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground mb-1", children: t("settings.language") }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-3", children: t("settings.languageDesc") }),
      /* @__PURE__ */ jsxs(Select, { value: language, onValueChange: (v) => setLanguage(v), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full rounded-lg bg-secondary text-foreground", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsx(SelectContent, { children: LANGUAGE_OPTIONS.map((opt) => /* @__PURE__ */ jsx(SelectItem, { value: opt.value, children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(FlagIcon, { lang: opt.value, className: "w-5 h-3.5" }),
          opt.label
        ] }) }, opt.value)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(
      CollapsibleSection,
      {
        icon: Moon,
        title: t("sleepTimer.title"),
        badge: isActive ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 bg-primary/20 text-primary rounded-full px-2.5 py-0.5 text-[10px] font-semibold font-mono", children: [
          "⏱ ",
          formattedTime
        ] }) : null,
        children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-3", children: t("sleepTimer.desc") }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2 mb-3", children: SLEEP_TIMER_OPTIONS.map((opt) => /* @__PURE__ */ jsx("button", { onClick: (e) => {
            e.stopPropagation();
            startTimer(opt.minutes);
          }, className: "py-2.5 rounded-lg text-xs font-semibold bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all", children: t(`sleepTimer.${opt.minutes}`) }, opt.minutes)) }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(Input, { type: "number", min: "1", max: "999", placeholder: t("sleepTimer.customPlaceholder"), value: customMinutes, onChange: (e) => setCustomMinutes(e.target.value), onClick: (e) => e.stopPropagation(), className: "flex-1 h-9 text-xs bg-secondary border-border" }),
            /* @__PURE__ */ jsx(Button, { onClick: (e) => {
              e.stopPropagation();
              const mins = parseInt(customMinutes);
              if (mins > 0) {
                startTimer(mins);
                setCustomMinutes("");
              }
            }, size: "sm", className: "h-9 px-4 text-xs font-semibold", disabled: !customMinutes || parseInt(customMinutes) <= 0, children: t("sleepTimer.customGo") })
          ] }),
          isActive && /* @__PURE__ */ jsxs(Button, { onClick: (e) => {
            e.stopPropagation();
            cancelTimer();
          }, variant: "outline", size: "sm", className: "w-full rounded-lg border-destructive/30 text-destructive text-xs gap-1.5", children: [
            /* @__PURE__ */ jsx(TimerOff, { className: "w-3.5 h-3.5" }),
            " ",
            t("sleepTimer.cancel")
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(CollapsibleSection, { icon: Heart, title: t("favorites.manage"), children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs(
        Button,
        {
          onClick: () => {
            if (subscriptions.length === 0) {
              toast({ title: t("favorites.noFavoritesToExport") });
              return;
            }
            const header = "id,title,author,image,url,categories,language";
            const rows = subscriptions.map(
              (s) => [s.id, s.title, s.author, s.image, s.url, s.categories.join(";"), s.language].map((v) => `"${String(v || "").replace(/"/g, '""')}"`).join(",")
            );
            const csv = [header, ...rows].join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "podcastsphere_subscriptions.csv";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1e3);
            toast({ title: `✅ ${t("favorites.exported")}` });
          },
          variant: "outline",
          size: "sm",
          className: "w-full rounded-lg text-xs gap-1.5",
          children: [
            /* @__PURE__ */ jsx(Download, { className: "w-3.5 h-3.5" }),
            t("favorites.export")
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: fileInputRef,
          type: "file",
          accept: ".csv,text/csv",
          className: "hidden",
          onChange: (e) => {
            var _a;
            const file = (_a = e.target.files) == null ? void 0 : _a[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              var _a2;
              try {
                const text = (_a2 = ev.target) == null ? void 0 : _a2.result;
                const lines = text.split("\n").filter((l) => l.trim());
                const dataLines = lines.slice(1);
                const podcasts = dataLines.map((line) => {
                  const cols = [];
                  let current = "";
                  let inQuotes = false;
                  for (let j = 0; j < line.length; j++) {
                    const ch = line[j];
                    if (inQuotes) {
                      if (ch === '"' && line[j + 1] === '"') {
                        current += '"';
                        j++;
                      } else if (ch === '"') {
                        inQuotes = false;
                      } else {
                        current += ch;
                      }
                    } else {
                      if (ch === '"') {
                        inQuotes = true;
                      } else if (ch === ",") {
                        cols.push(current);
                        current = "";
                      } else {
                        current += ch;
                      }
                    }
                  }
                  cols.push(current);
                  return {
                    id: parseInt(cols[0]) || Date.now(),
                    title: cols[1] || "Unknown",
                    author: cols[2] || "",
                    image: cols[3] || "",
                    description: "",
                    url: cols[4] || "",
                    categories: cols[5] ? cols[5].split(";").filter(Boolean) : [],
                    lastEpisodeDate: 0,
                    language: cols[6] || ""
                  };
                }).filter((p) => p.title && p.id);
                const count = importSubscriptions(podcasts);
                toast({ title: `✅ ${count} ${t("favorites.imported")}` });
              } catch {
                toast({ title: `❌ ${t("favorites.importError")}`, variant: "destructive" });
              }
            };
            reader.readAsText(file);
            e.target.value = "";
          }
        }
      ),
      /* @__PURE__ */ jsxs(
        Button,
        {
          onClick: () => {
            var _a;
            return (_a = fileInputRef.current) == null ? void 0 : _a.click();
          },
          variant: "outline",
          size: "sm",
          className: "w-full rounded-lg text-xs gap-1.5",
          children: [
            /* @__PURE__ */ jsx(Upload, { className: "w-3.5 h-3.5" }),
            t("favorites.import")
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(UserGuideModal, { onReopenWelcome }),
    /* @__PURE__ */ jsx(CollapsibleSection, { icon: Info, title: "À propos", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
          /* @__PURE__ */ jsx(Wifi, { className: "w-4 h-4 text-muted-foreground shrink-0" }),
          /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold text-foreground", children: t("settings.dataWarning") })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed pl-6", children: t("settings.dataWarningDesc") })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
          /* @__PURE__ */ jsx(Database, { className: "w-4 h-4 text-muted-foreground shrink-0" }),
          /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold text-foreground", children: t("settings.dataDisclaimer") })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed pl-6", children: t("settings.dataDisclaimerDesc") })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
          /* @__PURE__ */ jsx(Heart, { className: "w-4 h-4 text-pink-500 shrink-0" }),
          /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold text-foreground", children: t("settings.podcastIndexTitle") })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed pl-6 mb-2", children: t("settings.podcastIndexDesc") }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5 pl-6", children: [
          /* @__PURE__ */ jsxs("a", { href: "https://podcastindex.org/", target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-1.5 text-xs text-primary hover:underline", children: [
            /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" }),
            " podcastindex.org"
          ] }),
          /* @__PURE__ */ jsxs("a", { href: "https://podcastindex-org.github.io/docs-api/", target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-1.5 text-xs text-primary hover:underline", children: [
            /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" }),
            " API Documentation"
          ] }),
          /* @__PURE__ */ jsxs("a", { href: "https://github.com/Podcastindex-org", target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-1.5 text-xs text-primary hover:underline", children: [
            /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" }),
            " GitHub"
          ] }),
          /* @__PURE__ */ jsxs("a", { href: "https://podcastindex.social/", target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-1.5 text-xs text-primary hover:underline", children: [
            /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" }),
            " Mastodon / Social"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
          /* @__PURE__ */ jsx(Globe, { className: "w-4 h-4 text-primary shrink-0" }),
          /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold text-foreground", children: "radiosphere.be" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed pl-6 mb-2", children: "Podcast Sphere fait partie de la famille radiosphere.be." }),
        /* @__PURE__ */ jsxs("a", { href: "https://radiosphere.be", target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-1.5 text-xs text-primary hover:underline pl-6", children: [
          /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" }),
          " radiosphere.be"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1" }),
    onReopenWelcome && /* @__PURE__ */ jsxs("button", { onClick: onReopenWelcome, className: "flex items-center justify-center gap-1.5 text-xs text-primary hover:underline mb-1.5 w-full", children: [
      /* @__PURE__ */ jsx(Sparkles, { className: "w-3.5 h-3.5" }),
      " ",
      t("settings.reopenWelcome")
    ] }),
    onResetApp && /* @__PURE__ */ jsxs(AlertDialog, { children: [
      /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs("button", { className: "flex items-center justify-center gap-1.5 text-xs text-destructive hover:underline mb-2 w-full", children: [
        /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" }),
        " ",
        t("settings.resetApp")
      ] }) }),
      /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
        /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
          /* @__PURE__ */ jsx(AlertDialogTitle, { children: t("settings.resetApp") }),
          /* @__PURE__ */ jsx(AlertDialogDescription, { children: t("settings.resetConfirm") })
        ] }),
        /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
          /* @__PURE__ */ jsx(AlertDialogCancel, { children: t("common.cancel") }),
          /* @__PURE__ */ jsx(AlertDialogAction, { onClick: onResetApp, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: t("settings.resetButton") })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 mb-2", children: [
      /* @__PURE__ */ jsx("a", { href: "https://www.facebook.com/profile.php?id=61575475057830", target: "_blank", rel: "noopener noreferrer", className: "text-muted-foreground hover:text-primary transition-colors", "aria-label": "Facebook", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" }) }) }),
      /* @__PURE__ */ jsx("a", { href: "https://www.instagram.com/radiosphere.be/", target: "_blank", rel: "noopener noreferrer", className: "text-muted-foreground hover:text-primary transition-colors", "aria-label": "Instagram", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" }) }) }),
      /* @__PURE__ */ jsx("a", { href: "https://bsky.app/profile/radiospherebe.bsky.social", target: "_blank", rel: "noopener noreferrer", className: "text-muted-foreground hover:text-primary transition-colors", "aria-label": "Bluesky", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { d: "M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.627 3.6 3.476 6.158 3.226-4.476.767-8.204 2.632-4.782 7.527 3.958 5.174 5.962.46 7-2.47.18-.508.264-.745.345-.962.081-.217.164-.433.345-.942 1.038 2.93 3.042 7.644 7 2.47 3.422-4.895-.306-6.76-4.782-7.527 2.558.25 5.373-.599 6.158-3.226.246-.828.624-5.79.624-6.479 0-.688-.139-1.86-.902-2.203-.659-.3-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" }) }) })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-center text-[10px] leading-tight text-muted-foreground mb-1.5", children: t("settings.copyright") }),
    /* @__PURE__ */ jsxs("a", { href: "https://radiosphere.be/privacy-policy-podcastsphere.html", target: "_blank", rel: "noopener noreferrer", className: "flex items-center justify-center gap-1.5 text-xs text-primary hover:underline", children: [
      /* @__PURE__ */ jsx(ShieldCheck, { className: "w-3.5 h-3.5" }),
      " ",
      t("settings.privacyPolicy")
    ] })
  ] }) });
}
export {
  SettingsPage
};
