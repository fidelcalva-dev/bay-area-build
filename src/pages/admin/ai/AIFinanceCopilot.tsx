import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import CopilotDashboard from '@/components/ai/CopilotDashboard';

export default function AIFinanceCopilot() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const config = {
    type: 'FINANCE' as const,
    title: 'AI Finance Copilot',
    description: 'Collection priorities, overdue flags, and reconciliation gaps',
    capabilities: [
      'Summarize customer balance risk',
      'Flag overdue accounts by severity',
      'Recommend collection priority order',
      'Summarize invoice/payment status',
      'Detect missing dump fee reconciliation',
      'Identify unusual credits or adjustments',
      'Track AR aging trends',
      'Recommend payment follow-up timing',
    ],
    summaryCards: [
      { label: 'Overdue Invoices', value: '—' },
      { label: 'Total AR', value: '—' },
      { label: 'High Risk Accounts', value: '—' },
      { label: 'Collections Today', value: '—' },
    ],
  };

  return (
    <>
      <Helmet><title>AI Finance Copilot | Calsan</title></Helmet>
      <CopilotDashboard config={config} isAnalyzing={isAnalyzing} onRunAnalysis={() => { setIsAnalyzing(true); setTimeout(() => setIsAnalyzing(false), 2000); }} />
    </>
  );
}
