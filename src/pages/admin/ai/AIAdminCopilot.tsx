import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import CopilotDashboard from '@/components/ai/CopilotDashboard';

export default function AIAdminCopilot() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const config = {
    type: 'ADMIN' as const,
    title: 'AI Admin Copilot',
    description: 'System health oversight, workflow detection, and build priorities',
    capabilities: [
      'Summarize system health status',
      'Detect broken or missing workflows',
      'Detect duplicate routes',
      'Detect lead ingestion leaks',
      'Detect integration failures',
      'Identify high-priority fixes',
      'Recommend next build priorities',
      'Generate daily system summary',
    ],
    summaryCards: [
      { label: 'System Health', value: '—' },
      { label: 'Open Alerts', value: '—' },
      { label: 'Integration Issues', value: '—' },
      { label: 'Build Priorities', value: '—' },
    ],
  };

  return (
    <>
      <Helmet><title>AI Admin Copilot | Calsan</title></Helmet>
      <CopilotDashboard config={config} isAnalyzing={isAnalyzing} onRunAnalysis={() => { setIsAnalyzing(true); setTimeout(() => setIsAnalyzing(false), 2000); }} />
    </>
  );
}
