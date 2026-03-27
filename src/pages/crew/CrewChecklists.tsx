import { Helmet } from 'react-helmet-async';

export default function CrewChecklists() {
  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="p-4"><h2 className="text-xl font-bold text-foreground">Checklists</h2><p className="text-muted-foreground mt-2">Select a job to view its checklist items.</p></div>
    </>
  );
}
