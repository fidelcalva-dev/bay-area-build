import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import CopilotDashboard from '@/components/ai/CopilotDashboard';

export default function AISalesCopilot() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const config = {
    type: 'SALES' as const,
    title: 'AI Sales Copilot',
    description: 'Lead scoring, follow-up automation, and conversion optimization',
    capabilities: [
      'Summarize lead profile and history',
      'Score lead quality and urgency',
      'Recommend follow-up action (call/text/email)',
      'Recommend dumpster size based on project type',
      'Suggest quote messaging and pricing tier',
      'Detect stale leads needing attention',
      'Generate follow-up SMS/email drafts',
      'Flag commercial vs residential leads',
    ],
    summaryCards: [
      { label: 'Open Leads', value: '—' },
      { label: 'Stale (>2hrs)', value: '—' },
      { label: 'Avg Lead Score', value: '—' },
      { label: 'Conversion Rate', value: '—' },
    ],
  };

  const handleAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  return (
    <>
      <Helmet><title>AI Sales Copilot | Calsan</title></Helmet>
      <CopilotDashboard config={config} isAnalyzing={isAnalyzing} onRunAnalysis={handleAnalysis} />
    </>
  );
}
