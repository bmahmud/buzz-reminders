import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useServiceWorker(): void {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW may be unavailable in dev; web timers still work in-tab
    });
  }, []);
}
