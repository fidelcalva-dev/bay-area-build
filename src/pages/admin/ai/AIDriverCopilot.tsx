import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import CopilotDashboard from '@/components/ai/CopilotDashboard';

export default function AIDriverCopilot() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const config = {
    type: 'DRIVER' as const,
    title: 'AI Driver Copilot',
    description: 'Job summaries, missing step detection, and field assistance',
    capabilities: [
      'Explain next job and service instructions',
      'Summarize delivery/pickup requirements',
      'Detect missing photos after service',
      'Detect missing dump ticket uploads',
      'Remind driver of inspection steps',
      'Suggest next action after pickup',
      'Flag incomplete run documentation',
      'Provide site access instructions',
    ],
    summaryCards: [
      { label: 'Active Runs', value: '—' },
      { label: 'Missing Photos', value: '—' },
      { label: 'Missing Tickets', value: '—' },
      { label: 'Completed Today', value: '—' },
    ],
  };

  return (
    <>
      <Helmet><title>AI Driver Copilot | Calsan</title></Helmet>
      <CopilotDashboard config={config} isAnalyzing={isAnalyzing} onRunAnalysis={() => { setIsAnalyzing(true); setTimeout(() => setIsAnalyzing(false), 2000); }} />
    </>
  );
}
