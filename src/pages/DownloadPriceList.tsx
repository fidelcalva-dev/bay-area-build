import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { downloadPriceListPdf } from '@/utils/generatePriceListPdf';

export default function DownloadPriceList() {
  useEffect(() => {
    downloadPriceListPdf();
  }, []);

  return (
    <Layout title="Download Price List" noindex={true}>
      <div className="min-h-[60vh] flex items-center justify-center">
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
    </Layout>
  );
}
