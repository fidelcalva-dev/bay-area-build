import { useEffect } from 'react';
import { downloadPriceListPdf } from '@/utils/generatePriceListPdf';

export default function DownloadPriceList() {
  useEffect(() => {
    downloadPriceListPdf();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <p className="text-lg text-foreground">Tu PDF se está descargando...</p>
        <button
          onClick={downloadPriceListPdf}
          className="text-primary underline hover:opacity-80"
        >
          Click aquí si no inició la descarga
        </button>
      </div>
    </div>
  );
}
