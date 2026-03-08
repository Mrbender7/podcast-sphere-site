export function PodcastSphereLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sphere-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(160, 80%, 45%)" />
        </linearGradient>
      </defs>
      {/* Sphere */}
      <circle cx="32" cy="32" r="18" fill="url(#sphere-grad)" opacity="0.9" />
      <ellipse cx="32" cy="32" rx="18" ry="18" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.3" />
      {/* Sound waves */}
      <path d="M50 20 A24 24 0 0 1 50 44" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M55 14 A32 32 0 0 1 55 50" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M60 9 A40 40 0 0 1 60 55" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.2" />
    </svg>
  );
}
