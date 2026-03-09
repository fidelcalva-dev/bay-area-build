import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import CopilotDashboard from '@/components/ai/CopilotDashboard';

export default function AISeoCopilot() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const config = {
    type: 'SEO' as const,
    title: 'AI SEO Copilot',
    description: 'Page health analysis, content gaps, and ranking optimization',
    capabilities: [
      'Summarize overall SEO health',
      'Identify weak city pages',
      'Recommend content expansion targets',
      'Detect duplicate intent across pages',
      'Recommend internal link opportunities',
      'Identify missing FAQ sections',
      'Prioritize high-value city pages',
      'Track indexing coverage',
    ],
    summaryCards: [
      { label: 'Total Pages', value: '—' },
      { label: 'Health Score', value: '—' },
      { label: 'Content Gaps', value: '—' },
      { label: 'Indexed', value: '—' },
    ],
  };

  return (
    <>
      <Helmet><title>AI SEO Copilot | Calsan</title></Helmet>
      <CopilotDashboard config={config} isAnalyzing={isAnalyzing} onRunAnalysis={() => { setIsAnalyzing(true); setTimeout(() => setIsAnalyzing(false), 2000); }} />
    </>
  );
}
