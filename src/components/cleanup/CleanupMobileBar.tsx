import { Link } from 'react-router-dom';
import { Phone, FileText, Camera, Calendar } from 'lucide-react';

const ACTIONS = [
  { icon: FileText, label: 'Quote', href: '/cleanup/quote' },
  { icon: Phone, label: 'Call', href: 'tel:+15106802150', external: true },
  { icon: Camera, label: 'Photos', href: '/cleanup/quote#photos' },
  { icon: Calendar, label: 'Schedule', href: '/cleanup/contact' },
];

export function CleanupMobileBar() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-card/95 backdrop-blur border-t border-border">
      <div className="grid grid-cols-4 h-14">
        {ACTIONS.map(({ icon: Icon, label, href, external }) =>
          external ? (
            <a
              key={label}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground active:text-primary"
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </a>
          ) : (
            <Link
              key={label}
              to={href}
              className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground active:text-primary"
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
