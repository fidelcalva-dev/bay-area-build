import { useState } from 'react';
import { Download, X, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function InstallPrompt() {
  const { canInstall, showIOSGuide, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('pwa-install-dismissed') === 'true';
  });

  if (isInstalled || dismissed || (!canInstall && !showIOSGuide)) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) handleDismiss();
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-sm animate-slide-up">
      <div className="bg-card border border-border rounded-xl shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground">Install Calsan CRM</p>
            {showIOSGuide ? (
              <p className="text-xs text-muted-foreground mt-1">
                Tap <Share className="inline w-3 h-3" /> then "Add to Home Screen"
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Get instant access from your home screen
              </p>
            )}
          </div>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        {canInstall && (
          <Button onClick={handleInstall} size="sm" className="w-full mt-3">
            <Download className="w-4 h-4 mr-2" />
            Install Now
          </Button>
        )}
      </div>
    </div>
  );
}
