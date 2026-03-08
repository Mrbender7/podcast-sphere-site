import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

const LANGUAGES = [
  { code: "fr", label: "🇫🇷 FR" },
  { code: "en", label: "🇬🇧 EN" },
  { code: "es", label: "🇪🇸 ES" },
  { code: "de", label: "🇩🇪 DE" },
  { code: "ja", label: "🇯🇵 JA" },
  { code: "pt", label: "🇧🇷 PT" },
  { code: "it", label: "🇮🇹 IT" },
  { code: "ar", label: "🇸🇦 AR" },
];

interface LanguageFilterProps {
  selected: string;
  onChange: (lang: string) => void;
}

export function LanguageFilter({ selected, onChange }: LanguageFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
            selected === lang.code
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-accent/50 text-muted-foreground border-transparent hover:bg-accent"
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
