import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { evictOldEntries } from "@/services/ImageCacheService";

// Defer IndexedDB cleanup to avoid competing with initial render
setTimeout(() => evictOldEntries(), 5000);

createRoot(document.getElementById("root")!).render(<App />);
