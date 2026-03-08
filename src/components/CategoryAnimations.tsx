export function CategoryAnimation({ category }: { category: string }) {
  switch (category) {
    case "Technology":
      return (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-cyan-400/40 animate-wave-1" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-cyan-400/25 animate-wave-2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-cyan-400/15 animate-wave-3" />
        </div>
      );

    case "Comedy":
      return (
        <div className="absolute inset-0 z-20 pointer-events-none animate-orbit-clouds" style={{ animationDuration: "8s" }}>
          <span className="absolute top-0 left-1/2 text-[8px] font-bold text-yellow-300/80 drop-shadow-sm" style={{ textShadow: "0 0 4px rgba(255,220,0,0.4)" }}>ha</span>
          <span className="absolute bottom-1 right-1 text-[7px] font-bold text-yellow-200/70 drop-shadow-sm" style={{ textShadow: "0 0 4px rgba(255,220,0,0.3)" }}>ha</span>
          <span className="absolute left-0 top-1/2 text-[6px] font-bold text-amber-300/60 drop-shadow-sm">ha</span>
        </div>
      );

    case "News":
      return (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-gray-300/35 animate-wave-1" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-gray-300/20 animate-wave-2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-gray-300/10 animate-wave-3" />
        </div>
      );

    case "True Crime":
      return (
        <div className="absolute inset-0 z-20 pointer-events-none animate-orbit-clouds" style={{ animationDuration: "10s" }}>
          <span className="absolute top-0 left-1/2 text-[10px] text-red-300/70" style={{ textShadow: "0 0 6px rgba(255,100,100,0.4)" }}>?</span>
          <span className="absolute bottom-0 right-2 text-[8px] text-red-400/60" style={{ textShadow: "0 0 4px rgba(255,80,80,0.3)" }}>?</span>
          <span className="absolute left-1 top-1/3 text-[9px] text-rose-300/50">?</span>
        </div>
      );

    case "Health":
      return (
        <div className="absolute inset-0 z-20 pointer-events-none animate-orbit-clouds" style={{ animationDuration: "14s" }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2 rounded-full bg-emerald-300/50 blur-[2px] shadow-[0_0_6px_3px_rgba(110,230,180,0.3)]" />
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-1.5 rounded-full bg-teal-200/40 blur-[2px] shadow-[0_0_5px_2px_rgba(150,230,210,0.25)]" />
        </div>
      );

    case "Business":
      return (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <span className="absolute top-2 right-2 text-[9px] text-yellow-400/70 animate-float-up">↑</span>
          <span className="absolute top-4 left-3 text-[8px] text-yellow-300/60 animate-float-down">↓</span>
          <span className="absolute bottom-3 right-4 text-[10px] text-amber-400/70 animate-float-up" style={{ animationDelay: "0.5s" }}>↑</span>
          <span className="absolute bottom-5 left-2 text-[7px] text-yellow-200/50 animate-float-down" style={{ animationDelay: "0.7s" }}>↓</span>
        </div>
      );

    case "Science":
      return (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <span className="absolute top-1 left-2 text-[8px] animate-twinkle" style={{ color: "rgba(180,160,255,0.8)" }}>✦</span>
          <span className="absolute top-4 right-1 text-[6px] animate-twinkle" style={{ animationDelay: "0.8s", color: "rgba(200,180,255,0.7)" }}>✦</span>
          <span className="absolute bottom-2 left-4 text-[7px] animate-twinkle" style={{ animationDelay: "1.5s", color: "rgba(160,140,255,0.6)" }}>✦</span>
          <span className="absolute bottom-5 right-3 text-[5px] animate-twinkle" style={{ animationDelay: "2.2s", color: "rgba(190,170,255,0.7)" }}>✧</span>
        </div>
      );

    case "Education":
      return (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          <span className="absolute top-1 left-1 text-[7px] font-mono text-cyan-400/60 animate-matrix-fall">01</span>
          <span className="absolute top-0 right-3 text-[6px] font-mono text-green-400/50 animate-matrix-fall" style={{ animationDelay: "0.6s" }}>10</span>
          <span className="absolute top-2 left-1/2 text-[5px] font-mono text-cyan-300/40 animate-matrix-fall" style={{ animationDelay: "1.2s" }}>11</span>
          <span className="absolute top-1 right-1 text-[7px] font-mono text-green-300/50 animate-matrix-fall" style={{ animationDelay: "1.8s" }}>0</span>
        </div>
      );

    case "Sports":
      return (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <span className="absolute top-2 left-2 text-[7px] animate-bounce-ball">⚽</span>
          <span className="absolute bottom-3 right-2 text-[6px] animate-bounce-ball" style={{ animationDelay: "0.4s" }}>⚽</span>
        </div>
      );

    case "Music":
      return (
        <div className="absolute inset-0 z-20 pointer-events-none animate-orbit-clouds" style={{ animationDuration: "9s" }}>
          <span className="absolute top-0 left-1/2 text-[9px] text-fuchsia-300/70" style={{ textShadow: "0 0 6px rgba(220,100,255,0.4)" }}>♪</span>
          <span className="absolute bottom-0 right-1 text-[7px] text-purple-300/60" style={{ textShadow: "0 0 4px rgba(200,120,255,0.3)" }}>♫</span>
          <span className="absolute left-0 top-1/2 text-[8px] text-pink-300/50">♪</span>
        </div>
      );

    case "Society":
      return (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <span className="absolute top-1 left-1 text-[6px] font-bold text-yellow-300/60 animate-bla-pop">bla</span>
          <span className="absolute top-5 right-1 text-[5px] font-bold text-amber-200/50 animate-bla-pop" style={{ animationDelay: "1s" }}>bla</span>
          <span className="absolute bottom-2 left-3 text-[7px] font-bold text-yellow-400/55 animate-bla-pop" style={{ animationDelay: "2s" }}>bla</span>
        </div>
      );

    case "History":
      return (
        <div className="absolute inset-0 z-20 pointer-events-none animate-orbit-clouds" style={{ animationDuration: "16s" }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2 rounded-full bg-amber-300/45 blur-[2px] shadow-[0_0_6px_3px_rgba(200,170,80,0.3)]" />
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-1.5 rounded-full bg-yellow-200/35 blur-[2px] shadow-[0_0_5px_2px_rgba(210,190,100,0.25)]" />
        </div>
      );

    case "Fiction":
      return (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <span className="absolute top-1 right-2 text-[8px] animate-twinkle" style={{ color: "rgba(200,160,255,0.8)" }}>✨</span>
          <span className="absolute bottom-3 left-1 text-[6px] animate-twinkle" style={{ animationDelay: "1s", color: "rgba(220,180,255,0.7)" }}>✨</span>
          <span className="absolute top-5 left-3 text-[5px] animate-twinkle" style={{ animationDelay: "2s", color: "rgba(180,140,255,0.6)" }}>✨</span>
        </div>
      );

    case "Horror":
      return (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <span className="absolute top-2 left-1 text-[10px] text-red-900/70 animate-lightning">⚡</span>
          <span className="absolute bottom-3 right-2 text-[8px] text-gray-400/50 animate-lightning" style={{ animationDelay: "1.5s" }}>⚡</span>
        </div>
      );

    case "Video Games":
      return (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <span className="absolute top-1 left-2 text-[7px] animate-firework" style={{ color: "rgba(100,255,100,0.7)" }}>✦</span>
          <span className="absolute top-3 right-1 text-[6px] animate-firework" style={{ animationDelay: "0.5s", color: "rgba(255,200,50,0.7)" }}>✦</span>
          <span className="absolute bottom-2 left-4 text-[5px] animate-firework" style={{ animationDelay: "1s", color: "rgba(100,200,255,0.7)" }}>✦</span>
          <span className="absolute bottom-4 right-3 text-[7px] animate-firework" style={{ animationDelay: "1.5s", color: "rgba(255,100,200,0.7)" }}>✦</span>
        </div>
      );

    case "Arts":
      return (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="absolute top-2 left-1 w-1.5 h-1.5 rounded-full bg-pink-400/60 animate-paint-splash" />
          <div className="absolute top-5 right-2 w-1 h-1 rounded-full bg-purple-400/50 animate-paint-splash" style={{ animationDelay: "0.8s" }} />
          <div className="absolute bottom-3 left-3 w-2 h-1 rounded-full bg-fuchsia-300/55 animate-paint-splash" style={{ animationDelay: "1.6s" }} />
          <div className="absolute bottom-1 right-4 w-1.5 h-1.5 rounded-full bg-rose-400/45 animate-paint-splash" style={{ animationDelay: "2.4s" }} />
        </div>
      );

    case "Food":
      return (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="absolute bottom-6 left-3 w-1.5 h-3 rounded-full bg-white/20 blur-[2px] animate-steam" />
          <div className="absolute bottom-5 right-3 w-1 h-2.5 rounded-full bg-white/15 blur-[2px] animate-steam" style={{ animationDelay: "0.7s" }} />
          <div className="absolute bottom-7 left-1/2 w-1 h-2 rounded-full bg-white/15 blur-[1px] animate-steam" style={{ animationDelay: "1.4s" }} />
        </div>
      );

    default:
      return null;
  }
}
