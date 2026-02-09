import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface PremiumContextType {
  isPremium: boolean;
  togglePremium: () => void;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(() => {
    try { return localStorage.getItem("radiosphere_premium") === "true"; } catch { return false; }
  });

  const togglePremium = useCallback(() => {
    setIsPremium(prev => {
      const next = !prev;
      try { localStorage.setItem("radiosphere_premium", String(next)); } catch {}
      return next;
    });
  }, []);

  return (
    <PremiumContext.Provider value={{ isPremium, togglePremium }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be used within PremiumProvider");
  return ctx;
}
