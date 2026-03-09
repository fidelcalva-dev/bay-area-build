import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import CopilotDashboard from '@/components/ai/CopilotDashboard';

export default function AIDispatchCopilot() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const config = {
    type: 'DISPATCH' as const,
    title: 'AI Dispatch Copilot',
    description: 'Route optimization, driver assignment, and scheduling risk detection',
    capabilities: [
      'Recommend best yard for delivery',
      'Recommend best driver/truck assignment',
      'Detect risky or overloaded scheduling',
      'Identify overloaded routes',
      'Flag missing dump site assignments',
      'Suggest swap/pickup sequence optimization',
      'Flag service holds and blocks',
      'Estimate route drive times',
    ],
    summaryCards: [
      { label: "Today's Runs", value: '—' },
      { label: 'Unassigned Orders', value: '—' },
      { label: 'Route Conflicts', value: '—' },
      { label: 'Available Drivers', value: '—' },
    ],
  };

  return (
    <>
      <Helmet><title>AI Dispatch Copilot | Calsan</title></Helmet>
      <CopilotDashboard config={config} isAnalyzing={isAnalyzing} onRunAnalysis={() => { setIsAnalyzing(true); setTimeout(() => setIsAnalyzing(false), 2000); }} />
    </>
  );
}
