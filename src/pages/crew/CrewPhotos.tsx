import { Helmet } from 'react-helmet-async';

export default function CrewPhotos() {
  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="p-4"><h2 className="text-xl font-bold text-foreground">Upload Photos</h2><p className="text-muted-foreground mt-2">Before & after photos. Select a job to start uploading.</p></div>
    </>
  );
}
