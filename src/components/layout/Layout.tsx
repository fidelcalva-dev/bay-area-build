import { ReactNode, lazy, Suspense } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomBar } from './MobileBottomBar';
import { SEOHead } from '@/components/seo/SEOHead';
import { SWUpdatePrompt } from '@/components/pwa/SWUpdatePrompt';

// Lazy load AI chat widget to avoid impacting initial load
const AIChatWidget = lazy(() => import('@/components/chat/AIChatWidget'));

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  schema?: object | object[];
  hideChat?: boolean;
}

export function Layout({ 
  children, 
  title, 
  description, 
  canonical, 
  noindex,
  schema,
  hideChat = false,
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
        <SWUpdatePrompt />
        
        {/* AI Chat Widget */}
        {!hideChat && (
          <Suspense fallback={null}>
            <AIChatWidget />
          </Suspense>
        )}
      </div>
    </>
  );
}
