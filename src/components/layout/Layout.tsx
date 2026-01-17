import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomBar } from './MobileBottomBar';
import { SEOHead } from '@/components/seo/SEOHead';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  schema?: object | object[];
}

export function Layout({ 
  children, 
  title, 
  description, 
  canonical, 
  noindex,
  schema 
}: LayoutProps) {
  return (
    <>
      <SEOHead 
        title={title} 
        description={description} 
        canonical={canonical}
        noindex={noindex}
        schema={schema}
      />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileBottomBar />
      </div>
    </>
  );
}
