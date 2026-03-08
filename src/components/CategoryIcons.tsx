interface IconProps {
  size?: number;
  className?: string;
}

const defaultProps = { size: 44, className: "animate-neon-pulse" };

export function TechnologyIcon({ size = defaultProps.size, className = defaultProps.className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="54" stroke="hsl(200,90%,60%)" strokeWidth="1.2" opacity="0.3" />
      {/* Radio / Circuit board */}
      <rect x="32" y="42" width="56" height="36" rx="6" stroke="white" strokeWidth="2" opacity="0.85" />
      <circle cx="50" cy="60" r="10" stroke="white" strokeWidth="1.8" opacity="0.8" />
      <circle cx="50" cy="60" r="4" stroke="white" strokeWidth="1.2" opacity="0.6" />
      <line x1="70" y1="50" x2="80" y2="50" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="70" y1="56" x2="80" y2="56" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="70" y1="62" x2="80" y2="62" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="70" y1="68" x2="80" y2="68" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      {/* Antenna */}
      <line x1="45" y1="42" x2="38" y2="28" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
      <circle cx="38" cy="26" r="2.5" fill="white" opacity="0.7" />
      <path d="M30 22 A12 12 0 0 1 46 22" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4" />
    </svg>
  );
}

export function ComedyIcon({ size = defaultProps.size, className = defaultProps.className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="54" stroke="hsl(40,80%,50%)" strokeWidth="1.2" opacity="0.3" />
      <path d="M40 38C38 32 44 26 52 28L60 30L68 28C76 26 82 32 80 38L78 52C77 62 74 72 68 78C64 82 56 82 52 78C46 72 43 62 42 52Z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <path d="M46 42C47 39 50 38 53 40" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <path d="M67 40C70 38 73 39 74 42" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <path d="M47 48C48 45 52 45 53 48" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
      <path d="M67 48C68 45 72 45 73 48" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
      <path d="M59 52L58 57L61 58" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      <path d="M48 62C50 72 56 76 60 76C64 76 70 72 72 62" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

export function NewsIcon({ size = defaultProps.size, className = defaultProps.className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="54" stroke="hsl(210,20%,60%)" strokeWidth="1.2" opacity="0.3" />
      {/* Newspaper */}
      <rect x="30" y="34" width="50" height="52" rx="4" stroke="white" strokeWidth="2" opacity="0.85" />
      <rect x="36" y="40" width="24" height="4" rx="1" fill="white" opacity="0.7" />
      <line x1="36" y1="50" x2="74" y2="50" stroke="white" strokeWidth="1.2" opacity="0.5" />
      <line x1="36" y1="56" x2="74" y2="56" stroke="white" strokeWidth="1.2" opacity="0.5" />
      <line x1="36" y1="62" x2="74" y2="62" stroke="white" strokeWidth="1.2" opacity="0.5" />
      <line x1="36" y1="68" x2="60" y2="68" stroke="white" strokeWidth="1.2" opacity="0.5" />
      <line x1="36" y1="74" x2="74" y2="74" stroke="white" strokeWidth="1.2" opacity="0.4" />
      {/* Broadcast antenna */}
      <line x1="82" y1="48" x2="82" y2="30" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <path d="M76 34 A8 8 0 0 1 88 34" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M72 30 A14 14 0 0 1 92 30" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3" />
    </svg>
  );
}

export function TrueCrimeIcon({ size = defaultProps.size, className = defaultProps.className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="54" stroke="hsl(0,70%,45%)" strokeWidth="1.2" opacity="0.3" />
      {/* Magnifying glass */}
      <circle cx="52" cy="52" r="18" stroke="white" strokeWidth="2.2" opacity="0.85" />
      <line x1="65" y1="65" x2="82" y2="82" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
      {/* Fingerprint inside */}
      <path d="M46 48C46 44 50 40 54 42" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M44 52C44 46 50 42 56 44" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M48 56C48 50 52 46 56 48" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* Blood drop */}
      <path d="M78 38C78 38 82 44 82 47C82 50 80 52 78 52C76 52 74 50 74 47C74 44 78 38 78 38Z" fill="white" opacity="0.6" />
    </svg>
  );
}

export function HealthIcon({ size = defaultProps.size, className = defaultProps.className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="54" stroke="hsl(160,70%,45%)" strokeWidth="1.2" opacity="0.3" />
      {/* Stethoscope */}
      <path d="M44 40C44 40 40 52 40 60C40 72 50 78 60 78" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
      <path d="M76 40C76 40 80 52 80 60C80 68 74 72 68 72" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
      <circle cx="64" cy="78" r="8" stroke="white" strokeWidth="2" opacity="0.8" />
      {/* Heart */}
      <path d="M58 82C58 82 56 78 58 76C60 74 62 76 62 76C62 76 64 74 66 76C68 78 66 82 62 84Z" fill="white" opacity="0.7" />
      {/* Earpieces */}
      <circle cx="44" cy="38" r="3" stroke="white" strokeWidth="1.5" opacity="0.7" />
      <circle cx="76" cy="38" r="3" stroke="white" strokeWidth="1.5" opacity="0.7" />
    </svg>
  );
}

export function BusinessIcon({ size = defaultProps.size, className = defaultProps.className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="54" stroke="hsl(45,60%,50%)" strokeWidth="1.2" opacity="0.3" />
      {/* Bar chart */}
      <rect x="34" y="62" width="10" height="22" rx="2" stroke="white" strokeWidth="1.8" opacity="0.75" />
      <rect x="50" y="48" width="10" height="36" rx="2" stroke="white" strokeWidth="1.8" opacity="0.8" />
      <rect x="66" y="36" width="10" height="48" rx="2" stroke="white" strokeWidth="1.8" opacity="0.85" />
      {/* Arrow up */}
      <path d="M40 54L60 34L80 44" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
      <path d="M74 34L80 44L70 44" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
      {/* Money bag hint */}
      <circle cx="82" cy="30" r="6" stroke="white" strokeWidth="1.2" opacity="0.5" />
      <text x="82" y="33" textAnchor="middle" fill="white" fontSize="8" opacity="0.5" fontWeight="bold">$</text>
    </svg>
  );
}

export function ScienceIcon({ size = defaultProps.size, className = defaultProps.className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="54" stroke="hsl(260,70%,55%)" strokeWidth="1.2" opacity="0.3" />
      {/* Microscope */}
      <rect x="54" y="30" width="12" height="6" rx="2" stroke="white" strokeWidth="1.5" opacity="0.7" />
      <line x1="60" y1="36" x2="60" y2="58" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      <path d="M52 58L60 58L68 70L52 70Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" opacity="0.8" />
      <ellipse cx="60" cy="76" rx="20" ry="4" stroke="white" strokeWidth="1.8" opacity="0.7" />
      {/* Atom orbits */}
      <ellipse cx="82" cy="38" rx="12" ry="5" transform="rotate(-30 82 38)" stroke="white" strokeWidth="1.2" opacity="0.5" />
      <ellipse cx="82" cy="38" rx="12" ry="5" transform="rotate(30 82 38)" stroke="white" strokeWidth="1.2" opacity="0.5" />
      <circle cx="82" cy="38" r="2.5" fill="white" opacity="0.6" />
    </svg>
  );
}

export function EducationIcon({ size = defaultProps.size, className = defaultProps.className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="54" stroke="hsl(190,80%,50%)" strokeWidth="1.2" opacity="0.3" />
      {/* Graduation cap */}
      <path d="M30 52L60 38L90 52L60 66Z" stroke="white" strokeWidth="2" strokeLinejoin="round" opacity="0.85" />
      <line x1="90" y1="52" x2="90" y2="72" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <path d="M44 58V72C44 72 52 80 60 80C68 80 76 72 76 72V58" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.75" />
      {/* Tassel */}
      <circle cx="90" cy="74" r="2" fill="white" opacity="0.6" />
      <line x1="90" y1="76" x2="90" y2="82" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      {/* Book */}
      <path d="M48 84L60 80L72 84" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    </svg>
  );
}

export function SportsIcon({ size = defaultProps.size, className = defaultProps.className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="54" stroke="hsl(35,80%,50%)" strokeWidth="1.2" opacity="0.3" />
      {/* Trophy */}
      <path d="M42 36H78V50C78 64 70 74 60 74C50 74 42 64 42 50V36Z" stroke="white" strokeWidth="2.2" opacity="0.85" />
      <path d="M42 42H32C32 42 30 54 42 54" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M78 42H88C88 42 90 54 78 54" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />
      <line x1="60" y1="74" x2="60" y2="82" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <rect x="48" y="82" width="24" height="4" rx="2" stroke="white" strokeWidth="1.5" opacity="0.7" />
      {/* Star */}
      <path d="M60 44L62 50L68 50L63 54L65 60L60 56L55 60L57 54L52 50L58 50Z" fill="white" opacity="0.5" />
    </svg>
  );
}

export function MusicIcon({ size = defaultProps.size, className = defaultProps.className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="54" stroke="hsl(280,60%,55%)" strokeWidth="1.2" opacity="0.3" />
      {/* Treble clef stylized */}
      <path d="M56 30C56 30 50 40 50 52C50 62 56 68 60 72C56 78 50 80 50 86C50 92 56 94 60 92C64 90 64 86 62 84" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.85" />
      <line x1="60" y1="30" x2="60" y2="72" stroke="white" strokeWidth="1.5" opacity="0.5" />
      {/* Music notes */}
      <circle cx="76" cy="50" r="5" stroke="white" strokeWidth="1.8" opacity="0.7" />
      <line x1="81" y1="50" x2="81" y2="34" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <path d="M81 34L88 38" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      {/* Guitar hint */}
      <ellipse cx="38" cy="72" rx="8" ry="10" stroke="white" strokeWidth="1.5" opacity="0.5" />
      <line x1="38" y1="62" x2="38" y2="48" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

export function SocietyIcon({ size = defaultProps.size, className = defaultProps.className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="54" stroke="hsl(40,70%,50%)" strokeWidth="1.2" opacity="0.3" />
      {/* People */}
      <circle cx="60" cy="38" r="8" stroke="white" strokeWidth="2" opacity="0.85" />
      <path d="M44 62C44 52 52 48 60 48C68 48 76 52 76 62" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
      <circle cx="38" cy="50" r="6" stroke="white" strokeWidth="1.5" opacity="0.6" />
      <path d="M26 68C26 60 32 58 38 58C42 58 46 60 48 62" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
      <circle cx="82" cy="50" r="6" stroke="white" strokeWidth="1.5" opacity="0.6" />
      <path d="M94 68C94 60 88 58 82 58C78 58 74 60 72 62" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* Connection lines */}
      <line x1="44" y1="44" x2="52" y2="40" stroke="white" strokeWidth="1" opacity="0.3" />
      <line x1="76" y1="44" x2="68" y2="40" stroke="white" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

export function HistoryIcon({ size = defaultProps.size, className = defaultProps.className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="54" stroke="hsl(30,50%,45%)" strokeWidth="1.2" opacity="0.3" />
      {/* Hourglass */}
      <rect x="42" y="30" width="36" height="6" rx="2" stroke="white" strokeWidth="1.8" opacity="0.8" />
      <rect x="42" y="84" width="36" height="6" rx="2" stroke="white" strokeWidth="1.8" opacity="0.8" />
      <path d="M46 36L56 58L46 80" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85" />
      <path d="M74 36L64 58L74 80" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85" />
      {/* Sand */}
      <path d="M54 62L60 58L66 62L66 74L54 74Z" fill="white" opacity="0.3" />
    </svg>
  );
}

export function FictionIcon({ size = defaultProps.size, className = defaultProps.className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="54" stroke="hsl(270,60%,55%)" strokeWidth="1.2" opacity="0.3" />
      {/* Open book with magic */}
      <path d="M30 76V40C30 40 44 36 60 44" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
      <path d="M90 76V40C90 40 76 36 60 44" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
      <line x1="60" y1="44" x2="60" y2="76" stroke="white" strokeWidth="1.5" opacity="0.6" />
      <line x1="30" y1="76" x2="90" y2="76" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      {/* Magic sparkles */}
      <path d="M50 30L52 26L54 30L52 34Z" fill="white" opacity="0.6" />
      <path d="M70 28L71 25L72 28L71 31Z" fill="white" opacity="0.5" />
      <path d="M60 24L61 22L62 24L61 26Z" fill="white" opacity="0.4" />
    </svg>
  );
}

export function HorrorIcon({ size = defaultProps.size, className = defaultProps.className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="54" stroke="hsl(0,60%,35%)" strokeWidth="1.2" opacity="0.3" />
      {/* Skull */}
      <path d="M40 52C40 36 48 28 60 28C72 28 80 36 80 52C80 62 76 68 72 72L48 72C44 68 40 62 40 52Z" stroke="white" strokeWidth="2.2" opacity="0.85" />
      {/* Eyes */}
      <ellipse cx="50" cy="50" rx="6" ry="7" stroke="white" strokeWidth="1.8" opacity="0.8" />
      <ellipse cx="70" cy="50" rx="6" ry="7" stroke="white" strokeWidth="1.8" opacity="0.8" />
      {/* Nose */}
      <path d="M58 60L60 64L62 60" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      {/* Teeth */}
      <line x1="48" y1="72" x2="48" y2="80" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="54" y1="72" x2="54" y2="82" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="60" y1="72" x2="60" y2="80" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="66" y1="72" x2="66" y2="82" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="72" y1="72" x2="72" y2="80" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function VideoGamesIcon({ size = defaultProps.size, className = defaultProps.className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="54" stroke="hsl(140,60%,45%)" strokeWidth="1.2" opacity="0.3" />
      {/* Controller */}
      <path d="M28 58C28 48 36 42 46 42H74C84 42 92 48 92 58C92 68 86 78 78 78H72L66 70H54L48 78H42C34 78 28 68 28 58Z" stroke="white" strokeWidth="2.2" opacity="0.85" />
      {/* D-pad */}
      <rect x="38" y="54" width="4" height="12" rx="1" fill="white" opacity="0.6" />
      <rect x="34" y="58" width="12" height="4" rx="1" fill="white" opacity="0.6" />
      {/* Buttons */}
      <circle cx="76" cy="54" r="3" stroke="white" strokeWidth="1.5" opacity="0.7" />
      <circle cx="84" cy="60" r="3" stroke="white" strokeWidth="1.5" opacity="0.7" />
      <circle cx="76" cy="66" r="3" stroke="white" strokeWidth="1.5" opacity="0.7" />
      <circle cx="68" cy="60" r="3" stroke="white" strokeWidth="1.5" opacity="0.7" />
    </svg>
  );
}

export function ArtsIcon({ size = defaultProps.size, className = defaultProps.className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="54" stroke="hsl(310,60%,55%)" strokeWidth="1.2" opacity="0.3" />
      {/* Palette */}
      <path d="M60 28C38 28 24 44 24 60C24 76 38 88 56 88C60 88 62 86 62 82C62 78 58 76 58 72C58 66 64 62 70 62H78C92 62 96 48 88 38C82 30 72 28 60 28Z" stroke="white" strokeWidth="2.2" opacity="0.85" />
      <circle cx="44" cy="48" r="4" fill="white" opacity="0.6" />
      <circle cx="56" cy="40" r="4" fill="white" opacity="0.5" />
      <circle cx="70" cy="42" r="4" fill="white" opacity="0.6" />
      <circle cx="40" cy="64" r="4" fill="white" opacity="0.5" />
      {/* Brush */}
      <line x1="82" y1="74" x2="94" y2="86" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M80 72L84 76L82 78L78 74Z" fill="white" opacity="0.5" />
    </svg>
  );
}

export function FoodIcon({ size = defaultProps.size, className = defaultProps.className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="54" stroke="hsl(25,70%,50%)" strokeWidth="1.2" opacity="0.3" />
      {/* Fork */}
      <line x1="42" y1="30" x2="42" y2="90" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <line x1="36" y1="30" x2="36" y2="50" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="42" y1="30" x2="42" y2="50" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="48" y1="30" x2="48" y2="50" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M36 50C36 56 42 58 42 58C42 58 48 56 48 50" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
      {/* Knife */}
      <line x1="78" y1="30" x2="78" y2="90" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <path d="M78 30C78 30 86 34 86 50C86 56 78 58 78 58" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Plate */}
      <ellipse cx="60" cy="70" rx="20" ry="6" stroke="white" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

export function TravelIcon({ size = defaultProps.size, className = defaultProps.className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="54" stroke="hsl(195,70%,50%)" strokeWidth="1.2" opacity="0.3" />
      {/* Globe */}
      <circle cx="60" cy="56" r="22" stroke="white" strokeWidth="2" opacity="0.85" />
      <ellipse cx="60" cy="56" rx="10" ry="22" stroke="white" strokeWidth="1.2" opacity="0.5" />
      <line x1="38" y1="50" x2="82" y2="50" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <line x1="38" y1="62" x2="82" y2="62" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      {/* Plane */}
      <path d="M74 34L82 30L84 32L78 38L86 42L84 44L76 42L74 46L72 44L74 34Z" fill="white" opacity="0.6" />
      {/* Pin */}
      <circle cx="52" cy="82" r="4" stroke="white" strokeWidth="1.5" opacity="0.5" />
      <path d="M52 86L52 92" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

// Map category name to icon component
export const CATEGORY_ICON_MAP: Record<string, (props: IconProps) => JSX.Element> = {
  Technology: TechnologyIcon,
  Comedy: ComedyIcon,
  News: NewsIcon,
  "True Crime": TrueCrimeIcon,
  Health: HealthIcon,
  Business: BusinessIcon,
  Science: ScienceIcon,
  Education: EducationIcon,
  Sports: SportsIcon,
  Music: MusicIcon,
  Society: SocietyIcon,
  History: HistoryIcon,
  Fiction: FictionIcon,
  Horror: HorrorIcon,
  "Video Games": VideoGamesIcon,
  Arts: ArtsIcon,
  Food: FoodIcon,
  Travel: TravelIcon,
};
