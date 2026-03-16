// ============================================================
// AIMainChat — Homepage Dumpster Rental Assistant
// Headline + Subheadline + CalsanAIChat + Call CTA
// ============================================================
import { Phone } from 'lucide-react';
import { CalsanAIChat } from '@/components/chat/CalsanAIChat';
import { BUSINESS_INFO } from '@/lib/shared-data';

export function AIMainChat() {
  return (
    <div className="max-w-[850px] mx-auto">
      {/* Headline + Subheadline */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Not sure what size you need?
        </h2>
        <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-xl mx-auto leading-relaxed">
          Ask our dumpster assistant for a quick recommendation, estimate your project, and get exact pricing by ZIP.
        </p>
      </div>

      {/* Call Dispatch floating action */}
      <div className="flex justify-end mb-3">
        <a
          href={`tel:${BUSINESS_INFO.phone.sales}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-muted-foreground border border-border bg-card hover:border-primary/30 hover:text-foreground transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          Call Dispatch
        </a>
      </div>

      {/* Full structured chat engine */}
      <CalsanAIChat />
    </div>
  );
}

export default AIMainChat;
