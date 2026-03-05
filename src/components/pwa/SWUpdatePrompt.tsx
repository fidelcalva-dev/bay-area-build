import { useEffect, useState } from 'react';

/**
 * Detects when a new service worker is waiting and prompts the user to reload.
 * This ensures published changes are never blocked by a stale SW cache.
 */
export function SWUpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // If no SW is registered yet (dev/preview with PWA disabled), bail out
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return; // No SW registered — nothing to do

      const handleControllerChange = () => {
        window.location.reload();
      };
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      cleanupRef = () => navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);

      if (reg.waiting) {
        setShowUpdate(true);
      }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setShowUpdate(true);
          }
        });
      });
    }).catch(() => {
      // SW not available — silently ignore
    });

    let cleanupRef: (() => void) | undefined;
    return () => cleanupRef?.();
  }, []);

  const handleUpdate = () => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    });
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] bg-card border border-border shadow-lg rounded-xl px-5 py-3 flex items-center gap-3 text-sm">
      <span className="text-foreground font-medium">New version available</span>
      <button
        onClick={handleUpdate}
        className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg font-semibold text-xs hover:bg-primary/90 transition-colors"
      >
        Refresh
      </button>
    </div>
  );
}
