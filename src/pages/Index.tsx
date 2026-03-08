import { useState, useCallback } from "react";
import { PodcastDetailPage } from "@/pages/PodcastDetailPage";
import { PlayerProvider, usePlayer } from "@/contexts/PlayerContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { FavoritesProvider, useFavoritesContext } from "@/contexts/FavoritesContext";
import { LanguageProvider, useTranslation } from "@/contexts/LanguageContext";
import { SleepTimerProvider } from "@/contexts/SleepTimerContext";
import { BottomNav, TabId } from "@/components/BottomNav";
import { MiniPlayer } from "@/components/MiniPlayer";
import { FullScreenPlayer } from "@/components/FullScreenPlayer";
import { HomePage } from "@/pages/HomePage";
import { SearchPage } from "@/pages/SearchPage";
import { LibraryPage } from "@/pages/LibraryPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { WelcomePage } from "@/pages/WelcomePage";
import { ExitConfirmDialog } from "@/components/ExitConfirmDialog";
import { SleepTimerIndicator } from "@/components/SleepTimerIndicator";
import { useBackButton } from "@/hooks/useBackButton";
import type { Language } from "@/i18n/translations";
import type { Podcast } from "@/types/podcast";

const ONBOARDING_KEY = "podcastsphere_onboarded";

function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  } catch {
    return false;
  }
}

function AppContentInner() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showWelcome, setShowWelcome] = useState(!hasCompletedOnboarding());
  const [detailPodcast, setDetailPodcast] = useState<Podcast | null>(null);
  const { subscriptions } = useFavoritesContext();
  const { isFullScreen, closeFullScreen, currentEpisode } = usePlayer();
  const { setLanguage, t } = useTranslation();

  const handleCategoryClick = useCallback((category: string) => {
    // Translate the category key for the search query
    const translated = t(`category.${category}`);
    setSelectedCategory(translated);
    setActiveTab("search");
  }, [t]);

  const handlePodcastClick = useCallback((podcast: Podcast) => {
    setDetailPodcast(podcast);
  }, []);

  const handleTabChange = useCallback((tab: TabId) => {
    if (tab !== "search") setSelectedCategory(undefined);
    setDetailPodcast(null);
    setActiveTab(tab);
  }, []);

  const handleWelcomeComplete = useCallback((lang: Language) => {
    setLanguage(lang);
    try { localStorage.setItem(ONBOARDING_KEY, "true"); } catch {}
    setShowWelcome(false);
  }, [setLanguage]);

  const handleReopenWelcome = useCallback(() => {
    setShowWelcome(true);
  }, []);

  const handleResetApp = useCallback(async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    try {
      const dbs = await window.indexedDB.databases();
      for (const db of dbs) {
        if (db.name) window.indexedDB.deleteDatabase(db.name);
      }
    } catch {}
    window.location.reload();
  }, []);

  useBackButton({
    onBack: () => {
      if (showWelcome) return;
      if (isFullScreen) {
        closeFullScreen();
      } else {
        setActiveTab("home");
      }
    },
    onDoubleBackHome: () => setShowExitDialog(true),
    isHome: activeTab === "home",
    isFullScreen,
  });

  if (showWelcome) {
    return <WelcomePage onComplete={handleWelcomeComplete} />;
  }

  return (
    <PremiumProvider>
      <SleepTimerProvider>
        <SleepTimerIndicator />
        <div className="flex flex-col h-full bg-background" style={{ paddingTop: 'env(safe-area-inset-top, 24px)' }}>
          <div className={`flex-1 flex flex-col overflow-hidden ${currentEpisode ? 'pb-28' : 'pb-14'}`}>
            {detailPodcast ? (
              <PodcastDetailPage podcast={detailPodcast} onBack={() => setDetailPodcast(null)} />
            ) : (
              <>
                {activeTab === "home" && (
                  <HomePage
                    subscriptions={subscriptions}
                    onPodcastClick={handlePodcastClick}
                    onCategoryClick={handleCategoryClick}
                  />
                )}
                {activeTab === "search" && <SearchPage initialCategory={selectedCategory} />}
                {activeTab === "library" && <LibraryPage />}
                {activeTab === "settings" && <SettingsPage onReopenWelcome={handleReopenWelcome} onResetApp={handleResetApp} />}
              </>
            )}
          </div>
          <MiniPlayer />
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
          <FullScreenPlayer />
          <ExitConfirmDialog open={showExitDialog} onOpenChange={setShowExitDialog} />
        </div>
      </SleepTimerProvider>
    </PremiumProvider>
  );
}

function AppContent() {
  const { addRecent } = useFavoritesContext();

  return (
    <PlayerProvider onEpisodePlay={addRecent}>
      <AppContentInner />
    </PlayerProvider>
  );
}

const Index = () => (
  <LanguageProvider>
    <FavoritesProvider>
      <AppContent />
    </FavoritesProvider>
  </LanguageProvider>
);

export default Index;
