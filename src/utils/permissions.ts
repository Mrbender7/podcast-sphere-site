import { toast } from "@/hooks/use-toast";

/**
 * Re-requests app permissions (notifications + storage for downloads).
 * Location is handled by Cast plugin natively.
 */
export async function requestAllPermissions() {
  let granted = 0;
  let total = 0;

  // Notifications
  try {
    total++;
    if (window.hasOwnProperty("Capacitor")) {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      const result = await LocalNotifications.requestPermissions();
      if (result.display === "granted") granted++;
    } else if ("Notification" in window) {
      const result = await Notification.requestPermission();
      if (result === "granted") granted++;
    } else {
      granted++; // No notification API available
    }
  } catch {
    console.log("[Permissions] Notification permission request failed");
  }

  // Storage — Filesystem plugin handles runtime permissions automatically on Android 13+
  // On Android ≤12, it requests READ/WRITE_EXTERNAL_STORAGE
  // On Android 13+, it requests READ_MEDIA_AUDIO
  try {
    if (isNativePlatform()) {
      total++;
      const { Filesystem } = await import("@capacitor/filesystem");
      const result = await Filesystem.requestPermissions();
      if (result.publicStorage === "granted") granted++;
    }
  } catch {
    console.log("[Permissions] Storage permission request failed");
  }

  try {
    toast({
      title: `${granted}/${total}`,
      description: granted === total
        ? "✅ All permissions granted"
        : "⚠️ Some permissions were denied. You can enable them in your device settings.",
    });
  } catch {}
}

/** Check if running inside Capacitor native shell */
export function isNativePlatform(): boolean {
  try {
    return !!(window as any).Capacitor?.isNativePlatform();
  } catch {
    return false;
  }
}
