import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { evictOldEntries } from "@/services/ImageCacheService";

// Clean up old cached artworks on startup
evictOldEntries();

createRoot(document.getElementById("root")!).render(<App />);
