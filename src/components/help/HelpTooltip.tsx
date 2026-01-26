import { useState, useEffect } from 'react';
import { Info, AlertTriangle, XCircle, X, Eye, EyeOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type HelpSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
type HelpPlacement = 'tooltip' | 'popover' | 'inline';

interface HelpContent {
  id: string;
  help_key: string;
  title: string;
  body: string;
  severity: HelpSeverity;
}

interface HelpTooltipProps {
  helpKey: string;
  placement?: HelpPlacement;
  className?: string;
  showDismiss?: boolean;
  inline?: boolean;
}

const severityConfig = {
  INFO: {
    icon: Info,
    iconClass: 'text-blue-500',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    borderClass: 'border-blue-200 dark:border-blue-800',
    textClass: 'text-blue-800 dark:text-blue-200'
  },
  WARNING: {
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    borderClass: 'border-amber-200 dark:border-amber-800',
    textClass: 'text-amber-800 dark:text-amber-200'
  },
  CRITICAL: {
    icon: XCircle,
    iconClass: 'text-red-500',
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    borderClass: 'border-red-200 dark:border-red-800',
    textClass: 'text-red-800 dark:text-red-200'
  }
};

export function HelpTooltip({ 
  helpKey, 
  placement = 'tooltip', 
  className,
  showDismiss = true,
  inline = false
}: HelpTooltipProps) {
  const [content, setContent] = useState<HelpContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [tooltipsEnabled, setTooltipsEnabled] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Check if tooltips are enabled
        const { data: configData } = await supabase
          .from('config_settings')
          .select('value')
          .eq('category', 'help')
          .eq('key', 'tooltips_enabled')
          .maybeSingle();

        if (configData?.value === false) {
          setTooltipsEnabled(false);
          setIsLoading(false);
          return;
        }

        // Check if user dismissed this help
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: ackData } = await supabase
            .from('user_help_acknowledgements')
            .select('id')
            .eq('user_id', user.id)
            .eq('help_key', helpKey)
            .maybeSingle();

          if (ackData) {
            setIsDismissed(true);
            setIsLoading(false);
            return;
          }
        }

        // Fetch help content using fetch API to bypass type issues
        const helpResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/help_content?help_key=eq.${encodeURIComponent(helpKey)}&is_active=eq.true&select=id,help_key,title,body,severity`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
            }
          }
        );
        
        if (helpResponse.ok) {
          const helpData = await helpResponse.json();
          if (helpData && helpData.length > 0) {
            setContent(helpData[0] as HelpContent);
          }
        }
      } catch (err) {
        console.error('Error fetching help content:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [helpKey]);

  const handleDismiss = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Direct insert using fetch to bypass type issues
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_help_acknowledgements`,
          {
            method: 'POST',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ user_id: user.id, help_key: helpKey })
          }
        );
      }
      setIsDismissed(true);
    } catch (err) {
      console.error('Error dismissing help:', err);
    }
  };

  if (isLoading || !content || isDismissed || !tooltipsEnabled) {
    return null;
  }

  const config = severityConfig[content.severity];
  const IconComponent = config.icon;

  // Inline banner style
  if (inline || placement === 'inline') {
    return (
      <div className={cn(
        'flex items-start gap-3 p-3 rounded-lg border',
        config.bgClass,
        config.borderClass,
        className
      )}>
        <IconComponent className={cn('w-5 h-5 shrink-0 mt-0.5', config.iconClass)} />
        <div className="flex-1 min-w-0">
          <p className={cn('font-semibold text-sm', config.textClass)}>
            {content.title}
          </p>
          <p className={cn('text-sm mt-1', config.textClass, 'opacity-90')}>
            {content.body}
          </p>
        </div>
        {showDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 h-6 w-6 p-0"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  // Popover style (for more detailed help)
  if (placement === 'popover') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className={cn('inline-flex items-center', className)}>
            <IconComponent className={cn('w-4 h-4', config.iconClass)} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <IconComponent className={cn('w-5 h-5 shrink-0 mt-0.5', config.iconClass)} />
              <div className="flex-1">
                <p className="font-semibold text-sm">{content.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{content.body}</p>
              </div>
            </div>
            {showDismiss && (
              <div className="flex justify-end pt-2 border-t">
                <Button variant="ghost" size="sm" onClick={handleDismiss}>
                  <EyeOff className="w-3 h-3 mr-1" />
                  Don't show again
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Default tooltip style
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className={cn('inline-flex items-center', className)}>
            <IconComponent className={cn('w-4 h-4', config.iconClass)} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-semibold text-sm">{content.title}</p>
          <p className="text-sm opacity-90 mt-1">{content.body}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Hook for programmatic access to help content
export function useHelpContent(helpKey: string) {
  const [content, setContent] = useState<HelpContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/help_content?help_key=eq.${encodeURIComponent(helpKey)}&is_active=eq.true&select=id,help_key,title,body,severity`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setContent(data[0] as HelpContent);
          }
        }
      } catch (err) {
        console.error('Error fetching help:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [helpKey]);

  return { content, isLoading };
}

export default HelpTooltip;
