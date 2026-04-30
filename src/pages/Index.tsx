import { useState, useCallback, Suspense, lazy } from "react";
import { PodcastDetailPage } from "@/pages/PodcastDetailPage";
import { PlayerProvider, usePlayer } from "@/contexts/PlayerContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { FavoritesProvider, useFavoritesContext } from "@/contexts/FavoritesContext";
import { LanguageProvider, useTranslation } from "@/contexts/LanguageContext";
import { SleepTimerProvider } from "@/contexts/SleepTimerContext";
import { DownloadProvider } from "@/contexts/DownloadContext";
import { BottomNav, TabId } from "@/components/BottomNav";
import { MiniPlayer } from "@/components/MiniPlayer";
import { FullScreenPlayer } from "@/components/FullScreenPlayer";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { DesktopPlayerBar } from "@/components/DesktopPlayerBar";
import { Footer } from "@/components/Footer";
import { HomePage } from "@/pages/HomePage";
import { WelcomeModal } from "@/components/WelcomeModal";
import { InAppBrowserBanner } from "@/components/InAppBrowserBanner";
import { ExitConfirmDialog } from "@/components/ExitConfirmDialog";
import { SleepTimerIndicator } from "@/components/SleepTimerIndicator";
import { useBackButton } from "@/hooks/useBackButton";
import type { Language } from "@/i18n/translations";
import type { Podcast } from "@/types/podcast";

const SearchPage = lazy(() => import("@/pages/SearchPage").then(m => ({ default: m.SearchPage })));
const LibraryPage = lazy(() => import("@/pages/LibraryPage").then(m => ({ default: m.LibraryPage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then(m => ({ default: m.SettingsPage })));

const ONBOARDING_KEY = "podcastsphere_onboarded";

function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  } catch {
    return false;
  }
}

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
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

  const renderContent = () => {
    if (detailPodcast) {
      return <PodcastDetailPage podcast={detailPodcast} onBack={() => setDetailPodcast(null)} />;
    }
    switch (activeTab) {
      case "home":
        return (
          <HomePage
            subscriptions={subscriptions}
            onPodcastClick={handlePodcastClick}
            onCategoryClick={handleCategoryClick}
          />
        );
      case "search":
        return <SearchPage initialCategory={selectedCategory} />;
      case "library":
        return <LibraryPage />;
      case "settings":
        return <SettingsPage onReopenWelcome={handleReopenWelcome} onResetApp={handleResetApp} />;
      default:
        return null;
    }
  };

  return (
    <PremiumProvider>
      <SleepTimerProvider>
        <DownloadProvider>
          <SleepTimerIndicator />
          <InAppBrowserBanner />
          <div className="flex h-full bg-background">
            {/* Desktop sidebar */}
            <DesktopSidebar activeTab={activeTab} onTabChange={handleTabChange} />

            {/* Main area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Content */}
              <div
                className={`flex-1 flex flex-col overflow-hidden ${currentEpisode ? 'pb-28 lg:pb-0' : 'pb-14 lg:pb-0'}`}
                style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
              >
                <Suspense fallback={<PageLoader />}>
                  {renderContent()}
                </Suspense>
              </div>

              {/* Mobile: MiniPlayer + BottomNav */}
              <MiniPlayer />
              <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

              {/* Desktop: Player bar + Footer */}
              <DesktopPlayerBar />
              <Footer />
            </div>
          </div>

          <FullScreenPlayer />
          <ExitConfirmDialog open={showExitDialog} onOpenChange={setShowExitDialog} />
          <WelcomeModal open={showWelcome} onComplete={handleWelcomeComplete} />
        </DownloadProvider>
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
