import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Link2, Link2Off, Mail } from 'lucide-react';
import { googleService, GoogleConnectionStatus } from '@/services/googleService';
import { useToast } from '@/hooks/use-toast';

interface GoogleConnectButtonProps {
  onConnectionChange?: (status: GoogleConnectionStatus) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function GoogleConnectButton({ 
  onConnectionChange,
  variant = 'outline',
  size = 'default'
}: GoogleConnectButtonProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<GoogleConnectionStatus>({ isConnected: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    setIsLoading(true);
    try {
      const connectionStatus = await googleService.getConnectionStatus();
      setStatus(connectionStatus);
      onConnectionChange?.(connectionStatus);
    } catch (err) {
      console.error('Failed to load Google status:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConnect() {
    setIsConnecting(true);
    try {
      const result = await googleService.connectGoogleAccount();
      
      if (result.success) {
        toast({
          title: 'Google Account Connected',
          description: `Connected as ${result.email}`,
        });
        await loadStatus();
      } else {
        toast({
          title: 'Connection Failed',
          description: result.error || 'Failed to connect Google account',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Connection Error',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleDisconnect() {
    setIsConnecting(true);
    try {
      const result = await googleService.disconnectGoogleAccount();
      
      if (result.success) {
        toast({ title: 'Google Account Disconnected' });
        setStatus({ isConnected: false });
        onConnectionChange?.({ isConnected: false });
      } else {
        toast({
          title: 'Disconnect Failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  }

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (status.isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Mail className="w-3 h-3 mr-1" />
          {status.googleEmail}
        </Badge>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleDisconnect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Link2Off className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleConnect}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Link2 className="w-4 h-4 mr-2" />
      )}
      Connect Google
    </Button>
  );
}
