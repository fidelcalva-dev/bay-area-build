import { Menu, LogOut, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import logoCalsan from '@/assets/logo-calsan.jpeg';

interface MobileTopBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backPath?: string;
  onSignOut?: () => void;
  userEmail?: string;
  extraActions?: React.ReactNode;
}

export function MobileTopBar({
  title,
  subtitle,
  showBack,
  backPath,
  onSignOut,
  userEmail,
  extraActions,
}: MobileTopBarProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border safe-area-pt">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          {showBack ? (
            <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          ) : (
            <img src={logoCalsan} alt="Calsan" className="h-8 rounded-md" />
          )}
          <div className="min-w-0">
            <h1 className="font-semibold text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {extraActions}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {userEmail && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="text-sm font-medium truncate">{userEmail}</p>
                  </div>
                )}
                
                {onSignOut && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={onSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
