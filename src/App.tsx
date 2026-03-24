import React from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import type { RouteRecord } from "vite-react-ssg";

const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Helmet>
            <title>Podcast Sphere — Podcasts du monde entier</title>
            <meta name="description" content="Découvrez et écoutez des milliers de podcasts du monde entier sur Podcast Sphere. Propulsé par Podcast Index." />
          </Helmet>
          <Toaster />
          <Sonner />
          {children}
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <Layout><Index /></Layout>,
  },
  {
    path: "*",
    element: <Layout><NotFound /></Layout>,
  },
];
