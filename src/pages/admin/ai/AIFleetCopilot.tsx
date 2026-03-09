import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import CopilotDashboard from '@/components/ai/CopilotDashboard';

export default function AIFleetCopilot() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const config = {
    type: 'FLEET' as const,
    title: 'AI Fleet Copilot',
    description: 'Maintenance patterns, downtime risk, and preventive scheduling',
    capabilities: [
      'Summarize maintenance history per vehicle',
      'Detect recurring repair patterns',
      'Flag upcoming registration/insurance expiry',
      'Suggest preventive maintenance priorities',
      'Identify trucks at highest downtime risk',
      'Track repair cost trends',
      'Flag overdue inspections',
      'Recommend service scheduling windows',
    ],
    summaryCards: [
      { label: 'Active Trucks', value: '—' },
      { label: 'Open Work Orders', value: '—' },
      { label: 'Overdue Inspections', value: '—' },
      { label: 'Downtime Risk', value: '—' },
    ],
  };

  return (
    <>
      <Helmet><title>AI Fleet Copilot | Calsan</title></Helmet>
      <CopilotDashboard config={config} isAnalyzing={isAnalyzing} onRunAnalysis={() => { setIsAnalyzing(true); setTimeout(() => setIsAnalyzing(false), 2000); }} />
    </>
  );
}
