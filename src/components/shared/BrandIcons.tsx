// Brand Icons - SVG components for third-party brands
// These are simplified versions for badge/icon use

import { cn } from '@/lib/utils';

interface BrandIconProps {
  className?: string;
  size?: number;
}

export function GoogleIcon({ className, size = 16 }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn('flex-shrink-0', className)}
      aria-label="Google"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function FacebookIcon({ className, size = 16 }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn('flex-shrink-0', className)}
      aria-label="Facebook"
    >
      <path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
}

export function YelpIcon({ className, size = 16 }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn('flex-shrink-0', className)}
      aria-label="Yelp"
    >
      <path
        fill="#FF1A1A"
        d="M20.16 12.594l-4.995 1.433c-.96.276-1.074-.808-.9-1.205l2.216-5.046c.227-.518.857-.667 1.207-.325l2.688 2.63c.396.387.296 1.188-.216 1.513zm-3.01 5.854l-4.935-1.63c-.944-.31-.785-1.376-.37-1.706l4.42-3.515c.478-.38 1.15-.173 1.36.373l1.25 3.245c.26.672-.188 1.546-.725 1.233zm-8.13-1.77l2.24-4.492c.43-.862 1.516-.514 1.818-.107l3.153 4.233c.35.47.07 1.153-.477 1.348l-5.354 1.914c-.643.23-1.418-.306-1.38-.896zm-.35-6.14l5.18 1.795c.948.328.873 1.395.456 1.722l-4.32 3.37c-.475.37-1.147.147-1.36-.4l-1.43-3.68c-.267-.69.14-1.554.67-1.19l.804.383zm2.8-7.4l.135 5.2c.025.976-1.13 1.183-1.494.85L5.32 5.37c-.417-.38-.32-1.15.167-1.477l3.73-2.5c.577-.387 1.425.052 1.453.745z"
      />
    </svg>
  );
}

export function BBBIcon({ className, size = 16 }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn('flex-shrink-0', className)}
      aria-label="BBB"
    >
      <rect fill="#005A9C" width="24" height="24" rx="2" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        BBB
      </text>
    </svg>
  );
}

// Monochrome versions for use on colored backgrounds
export function GoogleIconMono({ className, size = 16 }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn('flex-shrink-0', className)}
      fill="currentColor"
      aria-label="Google"
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function FacebookIconMono({ className, size = 16 }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn('flex-shrink-0', className)}
      fill="currentColor"
      aria-label="Facebook"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
