import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './App';
import './index.css';
import { evictOldEntries } from '@/services/ImageCacheService';

export const createRoot = ViteReactSSG({ routes });

// Defer IndexedDB cleanup to avoid competing with initial render
if (typeof window !== 'undefined') {
  setTimeout(() => evictOldEntries(), 5000);
}
