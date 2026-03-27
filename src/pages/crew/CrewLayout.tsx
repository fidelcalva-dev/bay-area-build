import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ClipboardList, Camera, CheckCircle2, Home } from 'lucide-react';

const NAV = [
  { label: 'Today', href: '/crew', icon: Home },
  { label: 'Checklists', href: '/crew/checklists', icon: ClipboardList },
  { label: 'Photos', href: '/crew/photos', icon: Camera },
  { label: 'Complete', href: '/crew/complete', icon: CheckCircle2 },
];

export default function CrewLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card px-4 py-3">
        <h1 className="text-lg font-bold text-foreground">Crew Portal</h1>
      </header>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <nav className="border-t bg-card flex justify-around py-2">
        {NAV.map(n => (
          <Link
            key={n.href}
            to={n.href}
            className={cn(
              'flex flex-col items-center gap-1 text-xs',
              pathname === n.href ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <n.icon className="w-5 h-5" />
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
