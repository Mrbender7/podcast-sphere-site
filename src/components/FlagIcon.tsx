import type { Language } from "@/i18n/translations";

type FlagLang = Language | "pt" | "it" | "ar";

const FLAGS: Record<string, JSX.Element> = {
  fr: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <rect width="213.3" height="480" fill="#002395" />
      <rect x="213.3" width="213.4" height="480" fill="#fff" />
      <rect x="426.7" width="213.3" height="480" fill="#ed2939" />
    </svg>
  ),
  en: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <path fill="#012169" d="M0 0h640v480H0z" />
      <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0z" />
      <path fill="#C8102E" d="m424 281 216 159v40L369 281zm-184 20 6 35L54 480H0zM640 0v3L391 191l2-44L590 0zM0 0l239 176h-60L0 42z" />
      <path fill="#FFF" d="M241 0v480h160V0zM0 160v160h640V160z" />
      <path fill="#C8102E" d="M0 193v96h640v-96zM273 0v480h96V0z" />
    </svg>
  ),
  es: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <rect width="640" height="480" fill="#c60b1e" />
      <rect y="120" width="640" height="240" fill="#ffc400" />
    </svg>
  ),
  de: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <rect width="640" height="160" fill="#000" />
      <rect y="160" width="640" height="160" fill="#D00" />
      <rect y="320" width="640" height="160" fill="#FFCE00" />
    </svg>
  ),
  ja: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <rect width="640" height="480" fill="#fff" />
      <circle cx="320" cy="240" r="120" fill="#bc002d" />
    </svg>
  ),
  pt: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <rect width="640" height="480" fill="#009b3a" />
      <polygon points="320,40 600,240 320,440 40,240" fill="#fedf00" />
      <circle cx="320" cy="240" r="80" fill="#002776" />
      <path d="M244 240a76 76 0 0 1 152 0" fill="none" stroke="#fff" strokeWidth="4" />
    </svg>
  ),
  it: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <rect width="213.3" height="480" fill="#009246" />
      <rect x="213.3" width="213.4" height="480" fill="#fff" />
      <rect x="426.7" width="213.3" height="480" fill="#ce2b37" />
    </svg>
  ),
  ar: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <rect width="640" height="160" fill="#006c35" />
      <rect y="160" width="640" height="160" fill="#fff" />
      <rect y="320" width="640" height="160" fill="#000" />
      <text x="320" y="260" textAnchor="middle" fill="#006c35" fontSize="80" fontFamily="serif">لا إله إلا الله</text>
    </svg>
  ),
};

interface FlagIconProps {
  lang: string;
  className?: string;
}

export function FlagIcon({ lang, className = "w-6 h-4" }: FlagIconProps) {
  const flag = FLAGS[lang];
  if (!flag) return null;
  return (
    <span className={`inline-block rounded-sm overflow-hidden shadow-sm ${className}`}>
      {flag}
    </span>
  );
}
