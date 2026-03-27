import { Helmet } from 'react-helmet-async';

export default function CrewComplete() {
  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="p-4"><h2 className="text-xl font-bold text-foreground">Complete Job</h2><p className="text-muted-foreground mt-2">Mark a job as completed after finishing all checklist items and uploading photos.</p></div>
    </>
  );
}
