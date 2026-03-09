import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import CopilotDashboard from '@/components/ai/CopilotDashboard';

export default function AICsCopilot() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const config = {
    type: 'CS' as const,
    title: 'AI Customer Service Copilot',
    description: 'Customer summaries, response drafts, and escalation detection',
    capabilities: [
      'Summarize customer history and open orders',
      'Suggest response drafts for common queries',
      'Detect upset customer risk from messages',
      'Recommend escalation level',
      'Highlight unpaid invoices before responding',
      'Summarize recent communication timeline',
      'Flag repeat service issues',
      'Recommend next support action',
    ],
    summaryCards: [
      { label: 'Open Tickets', value: '—' },
      { label: 'Pending Responses', value: '—' },
      { label: 'Escalations Today', value: '—' },
      { label: 'Avg Resolution Time', value: '—' },
    ],
  };

  return (
    <>
      <Helmet><title>AI CS Copilot | Calsan</title></Helmet>
      <CopilotDashboard config={config} isAnalyzing={isAnalyzing} onRunAnalysis={() => { setIsAnalyzing(true); setTimeout(() => setIsAnalyzing(false), 2000); }} />
    </>
  );
}
