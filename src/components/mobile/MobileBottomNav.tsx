import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface MobileNavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface MobileBottomNavProps {
  items: MobileNavItem[];
  basePath: string;
}

export function MobileBottomNav({ items, basePath }: MobileBottomNavProps) {
  const location = useLocation();

  const isActive = (item: MobileNavItem) => {
    if (item.end) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path) && item.path !== basePath;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.end 
            ? location.pathname === item.path 
            : isActive(item);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full px-2 transition-colors',
                active 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', active && 'stroke-[2.5px]')} />
              <span className="text-[10px] mt-1 font-medium truncate max-w-[60px]">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
