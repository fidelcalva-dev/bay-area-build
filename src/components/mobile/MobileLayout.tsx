import { ReactNode } from 'react';
import { MobileTopBar } from './MobileTopBar';
import { MobileBottomNav, MobileNavItem } from './MobileBottomNav';

interface MobileLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backPath?: string;
  navItems: MobileNavItem[];
  basePath: string;
  onSignOut?: () => void;
  userEmail?: string;
  extraActions?: ReactNode;
  hideBottomNav?: boolean;
}

export function MobileLayout({
  children,
  title,
  subtitle,
  showBack,
  backPath,
  navItems,
  basePath,
  onSignOut,
  userEmail,
  extraActions,
  hideBottomNav,
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <MobileTopBar
        title={title}
        subtitle={subtitle}
        showBack={showBack}
        backPath={backPath}
        onSignOut={onSignOut}
        userEmail={userEmail}
        extraActions={extraActions}
      />
      
      <main className={`flex-1 overflow-auto ${!hideBottomNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      
      {!hideBottomNav && (
        <MobileBottomNav items={navItems} basePath={basePath} />
      )}
    </div>
  );
}
