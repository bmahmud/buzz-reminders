import { useEffect, useState } from 'react';
import { useSettingsStore } from '../store/settings';

export function useSettingsHydration(): boolean {
  const [hydrated, setHydrated] = useState(() =>
    useSettingsStore.persist.hasHydrated()
  );

  useEffect(() => {
    // Handle race on web: hydration can finish before listener registration.
    setHydrated(useSettingsStore.persist.hasHydrated());

    const unsub = useSettingsStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );
    return unsub;
  }, []);

  return hydrated;
}
