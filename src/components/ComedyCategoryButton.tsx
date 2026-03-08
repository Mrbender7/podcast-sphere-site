import { cn } from "@/lib/utils";

interface ComedyCategoryButtonProps {
  onClick?: () => void;
  className?: string;
  size?: number;
}

export function ComedyCategoryButton({ onClick, className, size = 64 }: ComedyCategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center rounded-full bg-transparent transition-transform duration-200 hover:scale-105 active:scale-95",
        className
      )}
      aria-label="Comedy"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-neon-pulse"
      >
        {/* Outer circle */}
        <circle cx="60" cy="60" r="54" stroke="white" strokeWidth="1.5" opacity="0.85" />

        {/* Mask outline - face shape */}
        <path
          d="M40 38 C38 32, 44 26, 52 28 L60 30 L68 28 C76 26, 82 32, 80 38 L78 52 C77 62, 74 72, 68 78 C64 82, 56 82, 52 78 C46 72, 43 62, 42 52 Z"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* Left eyebrow */}
        <path
          d="M46 42 C47 39, 50 38, 53 40"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Right eyebrow */}
        <path
          d="M67 40 C70 38, 73 39, 74 42"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Left eye */}
        <path
          d="M47 48 C48 45, 52 45, 53 48"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Right eye */}
        <path
          d="M67 48 C68 45, 72 45, 73 48"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Nose */}
        <path
          d="M59 52 L58 57 L61 58"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />

        {/* Big smile */}
        <path
          d="M48 62 C50 72, 56 76, 60 76 C64 76, 70 72, 72 62"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Smile inner line (teeth hint) */}
        <path
          d="M50 66 C54 69, 58 70, 60 70 C62 70, 66 69, 70 66"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </button>
  );
}
