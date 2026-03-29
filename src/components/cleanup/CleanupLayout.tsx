import { ReactNode } from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import { CleanupHeader } from './CleanupHeader';
import { CleanupFooter } from './CleanupFooter';
import { CleanupMobileBar } from './CleanupMobileBar';

interface CleanupLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  schema?: object | object[];
}

export function CleanupLayout({
  children,
  title,
  description,
  canonical,
  noindex,
  schema,
}: CleanupLayoutProps) {
  return (
    <>
      <SEOHead
        title={title}
        description={description}
        canonical={canonical}
        noindex={noindex}
        schema={schema}
      />
      <div className="flex flex-col min-h-screen bg-background">
        {/* Top bar */}
        <div className="bg-primary text-primary-foreground text-xs py-1.5 text-center font-medium tracking-wide">
          Licensed Construction Cleanup · CSLB #1152237 · Serving Oakland, Alameda &amp; the Bay Area
        </div>
        <CleanupHeader />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <CleanupFooter />
        <CleanupMobileBar />
      </div>
    </>
  );
}
