import { useCallback, useSyncExternalStore } from 'react';

/** Subscribe to a media query and return whether it currently matches. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

const subscribeResize = (onChange: () => void) => {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
};

/** Current viewport width in CSS pixels. */
export function useViewportWidth(): number {
  return useSyncExternalStore(subscribeResize, () => document.documentElement.clientWidth, () => 1024);
}
