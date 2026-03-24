import { jsx, jsxs } from "react/jsx-runtime";
import { c as cn, u as useTranslation, i as requestAllPermissions, j as useSleepTimer, k as podcastSphereLogo, l as Select, m as SelectTrigger, n as SelectValue, o as SelectContent, L as LANGUAGE_OPTIONS, q as SelectItem, t as SLEEP_TIMER_OPTIONS, B as Button, A as AlertDialog, v as AlertDialogTrigger, w as AlertDialogContent, x as AlertDialogHeader, y as AlertDialogTitle, z as AlertDialogDescription, D as AlertDialogFooter, E as AlertDialogCancel, F as AlertDialogAction } from "../main.mjs";
import { X, BookOpen, ChevronDown, RefreshCw, Home, Search, Bookmark, Settings, ShieldAlert, Moon, TimerOff, Wifi, Database, Heart, ExternalLink, Globe, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
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
import "@capacitor/share";
import "@radix-ui/react-slider";
import "@radix-ui/react-popover";
import "@radix-ui/react-checkbox";
import "@radix-ui/react-slot";
import "@radix-ui/react-select";
import "@radix-ui/react-alert-dialog";
import "react-router-dom";
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(DialogPrimitive.Description, { ref, className: cn("text-sm text-muted-foreground", className), ...props }));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
const SECTIONS = [
  { id: "home", icon: Home, titleKey: "guide.home", contentKey: "guide.homeContent" },
  { id: "search", icon: Search, titleKey: "guide.search", contentKey: "guide.searchContent" },
  { id: "favorites", icon: Bookmark, titleKey: "guide.favorites", contentKey: "guide.favoritesContent" },
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
                "overflow-hidden transition-all duration-300 ease-in-out",
                isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
              ),
              children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed px-3.5 pb-2", children: t(contentKey) }),
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
function CollapsibleDisclaimer({ icon: Icon, iconSize, title, desc }) {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxs("button", { onClick: () => setOpen((o) => !o), className: "w-full rounded-xl border border-border bg-accent/50 p-4 mb-4 text-left transition-all", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(Icon, { className: cn(iconSize, "text-muted-foreground shrink-0") }),
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground flex-1", children: title }),
      /* @__PURE__ */ jsx(ChevronDown, { className: cn("w-4 h-4 text-muted-foreground transition-transform duration-300", open && "rotate-180") })
    ] }),
    /* @__PURE__ */ jsx("div", { className: cn("overflow-hidden transition-all duration-300 ease-in-out", open ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"), children: /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed pl-[calc(theme(spacing.3)+theme(spacing.3))]", children: desc }) })
  ] });
}
function SettingsPage({ onReopenWelcome, onResetApp }) {
  const { language, setLanguage, t } = useTranslation();
  const { isActive, formattedTime, startTimer, cancelTimer } = useSleepTimer();
  const [customMinutes, setCustomMinutes] = useState("");
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto px-4 pb-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-6 mb-6", children: [
      /* @__PURE__ */ jsx("img", { src: podcastSphereLogo, alt: "Podcast Sphere", className: "w-10 h-10 rounded-xl mix-blend-screen animate-logo-glow" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-heading font-bold bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent", children: "Podcast Sphere" })
    ] }),
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-heading font-bold mb-4 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent", children: t("settings.title") }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-accent p-4 mb-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground mb-1", children: t("settings.language") }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-3", children: t("settings.languageDesc") }),
      /* @__PURE__ */ jsxs(Select, { value: language, onValueChange: (v) => setLanguage(v), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full rounded-lg bg-secondary text-foreground", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsx(SelectContent, { children: LANGUAGE_OPTIONS.map((opt) => /* @__PURE__ */ jsxs(SelectItem, { value: opt.value, children: [
          opt.flag,
          " ",
          opt.label
        ] }, opt.value)) })
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
    /* @__PURE__ */ jsx(UserGuideModal, { onReopenWelcome }),
    [
      { icon: Wifi, iconSize: "w-5 h-5", title: t("settings.dataWarning"), desc: t("settings.dataWarningDesc"), key: "data" },
      { icon: Database, iconSize: "w-4 h-4", title: t("settings.dataDisclaimer"), desc: t("settings.dataDisclaimerDesc"), key: "local" }
    ].map(({ icon: Icon, iconSize, title, desc, key }) => /* @__PURE__ */ jsx(CollapsibleDisclaimer, { icon: Icon, iconSize, title, desc }, key)),
    /* @__PURE__ */ jsxs("div", { className: "w-full rounded-xl border border-border bg-accent/50 p-4 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsx(Heart, { className: "w-5 h-5 text-pink-500" }),
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground", children: t("settings.podcastIndexTitle") })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed mb-3", children: t("settings.podcastIndexDesc") }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
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
    /* @__PURE__ */ jsxs("div", { className: "w-full rounded-xl border border-border bg-accent/50 p-4 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsx(Globe, { className: "w-5 h-5 text-primary" }),
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground", children: "À propos" })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed mb-3", children: [
        "Podcast Sphere fait partie de la famille",
        " ",
        /* @__PURE__ */ jsx("a", { href: "https://radiosphere.be", target: "_blank", rel: "noopener noreferrer", className: "text-primary underline underline-offset-2", children: "radiosphere.be" }),
        "."
      ] }),
      /* @__PURE__ */ jsxs("a", { href: "https://radiosphere.be", target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-1.5 text-xs text-primary hover:underline", children: [
        /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" }),
        " radiosphere.be"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("a", { href: "https://radiosphere.be/privacy-policy-podcastsphere.html", target: "_blank", rel: "noopener noreferrer", className: "flex items-center justify-center gap-1.5 text-xs text-primary hover:underline mb-3", children: [
      /* @__PURE__ */ jsx(ShieldCheck, { className: "w-3.5 h-3.5" }),
      " ",
      t("settings.privacyPolicy")
    ] }),
    onReopenWelcome && /* @__PURE__ */ jsxs("button", { onClick: onReopenWelcome, className: "flex items-center justify-center gap-1.5 text-xs text-primary hover:underline mb-3 w-full", children: [
      /* @__PURE__ */ jsx(Sparkles, { className: "w-3.5 h-3.5" }),
      " ",
      t("settings.reopenWelcome")
    ] }),
    onResetApp && /* @__PURE__ */ jsxs(AlertDialog, { children: [
      /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs("button", { className: "flex items-center justify-center gap-1.5 text-xs text-destructive hover:underline mb-4 w-full", children: [
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
    /* @__PURE__ */ jsx("p", { className: "text-center text-[10px] text-muted-foreground mb-6", children: "Podcast Sphere v1.0" })
  ] });
}
export {
  SettingsPage
};
