import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PrivacyNoticeAtCollectionProps {
  /** Compact mode for inline forms; full mode for standalone sections */
  variant?: 'compact' | 'full';
  /** Additional CSS classes */
  className?: string;
}

/**
 * CCPA/CPRA Notice at Collection — must appear at or before the point
 * where personal information is collected.
 */
export function PrivacyNoticeAtCollection({
  variant = 'compact',
  className = '',
}: PrivacyNoticeAtCollectionProps) {
  if (variant === 'compact') {
    return (
      <div className={`text-xs text-muted-foreground leading-relaxed ${className}`}>
        <p>
          <Shield className="w-3 h-3 inline mr-1 -mt-0.5" />
          We collect your name, contact info, and project details to provide service quotes, process orders, and communicate about your project.
          Data is retained while your account is active and as required by law.{' '}
          <Link to="/privacy" className="text-primary underline hover:text-primary/80">
            Privacy Policy
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground space-y-2 ${className}`}>
      <p className="font-medium text-foreground flex items-center gap-1.5 text-xs uppercase tracking-wide">
        <Shield className="w-3.5 h-3.5" />
        Notice at Collection
      </p>
      <ul className="list-disc pl-5 space-y-1 text-xs">
        <li>
          <strong>Categories collected:</strong> Name, phone, email, address, project details, device/browser info for analytics.
        </li>
        <li>
          <strong>Purposes:</strong> Provide quotes and services, communicate about your project, improve our website experience, and comply with legal obligations.
        </li>
        <li>
          <strong>Retention:</strong> Data is retained while your account or project is active and as required by applicable law.
        </li>
      </ul>
      <p className="text-xs">
        Read our full{' '}
        <Link to="/privacy" className="text-primary underline hover:text-primary/80">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
