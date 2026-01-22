import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  Users, FileText, Settings, LogOut, 
  Menu, X, Home, MessageSquare, Search, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useMobileMode } from "@/hooks/useMobileMode";
import logoCalsan from "@/assets/logo-calsan.jpeg";
import { cn } from "@/lib/utils";
import { MobileLayout, MobileNavItem, MobileGlobalSearch } from "@/components/mobile";

const SALES_NAV = [
  { label: "Dashboard", href: "/sales", icon: Home },
  { label: "Leads", href: "/sales/leads", icon: Users },
  { label: "Quotes", href: "/sales/quotes", icon: FileText },
  { label: "New Quote", href: "/quote", icon: MessageSquare },
];

const mobileNavItems: MobileNavItem[] = [
  { path: "/sales/leads", label: "Leads", icon: Users },
  { path: "/sales/quotes", label: "Quotes", icon: FileText },
  { path: "/sales", label: "Home", icon: Home, end: true },
  { path: "/sales/search", label: "Search", icon: Search },
];

export default function SalesLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading, isSales, isAdmin, signOut } = useAdminAuth();
  const { mobileMode } = useMobileMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/admin/login");
    }
    if (!isLoading && user && !isSales && !isAdmin) {
      navigate("/admin");
    }
  }, [isLoading, user, isSales, isAdmin, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Mobile Layout
  if (mobileMode) {
    const isSearchPage = location.pathname === "/sales/search";
    
    return (
      <MobileLayout
        title="Sales"
        subtitle="Leads & Quotes"
        navItems={mobileNavItems}
        basePath="/sales"
        onSignOut={handleLogout}
        userEmail={user?.email || undefined}
      >
        {isSearchPage ? (
          <MobileGlobalSearch basePath="/sales" />
        ) : (
          <Outlet />
        )}
      </MobileLayout>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-background border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <img src={logoCalsan} alt="Calsan" className="h-8 rounded" />
          <span className="font-semibold">Sales Portal</span>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoCalsan} alt="Calsan" className="h-10 rounded-lg" />
              <div>
                <p className="font-bold text-foreground">Sales Portal</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {SALES_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-2">
            {isAdmin && (
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Link>
              </Button>
            )}
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}