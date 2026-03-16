import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PRICE_DATA = [
  ['GA', 571, 571, 782.75, 608.50, 608.50, 899.20, 581.60, 629.50, 687, 744.50, 755, 881],
  ['GB', 591, 591, 802.75, 628.50, 628.50, 919.20, 601.60, 649.50, 707, 764.50, 775, 958.40],
  ['GBb', 591, 591, 802.75, 628.50, 628.50, 919.20, 601.60, 609.50, 667, 764.50, 775, 958.40],
  ['GC', 651, 651, 862.75, 688.50, 688.50, 979.20, 661.60, 709.50, 767, 824.50, 835, 961],
  ['GD', 652.50, 652.50, 882.50, 721.50, 721.50, 966, 658.25, 715.75, 773.25, 830.75, 911.25, 1049.25],
  ['GE', 676, 676, 887.75, 713.50, 713.50, 1004.20, 686.60, 734.50, 792, 849.50, 860, 986],
  ['GF', 697.25, 697.25, 907.25, 760.25, 760.25, 998.87, 702.50, 755, 807.50, 860, 933.50, 1059.50],
  ['GG', 701, 701, 887.75, 738.50, 738.50, 1029.20, 711.60, 759.50, 817, 874.50, 885, 1011],
  ['GH', 726, 726, 937.75, 763.50, 763.50, 1054.20, 736.60, 784.50, 842, 899.50, 910, 1036],
  ['GI', 801, 801, 1012.75, 838.50, 838.50, 1129.20, 811.60, 859.50, 917, 974.50, 985, 1111],
  ['GJ', 807.50, 807.50, 1017.50, 870.50, 870.50, 1101.50, 812.75, 865.25, 917.75, 970.25, 1043.75, 1169.75],
];

const OVERRIDES = [
  ['94662 (Oakland)', 591, 591, 802.75, 628.50, 628.50, 919.20, 601.60, 649.50, 707, 764.50, 775, 901],
  ['94557 (Mt Eden)', 652.50, 652.50, 882.50, 721.50, 721.50, 966, 658.25, 649.50, 773.25, 830.75, 911.25, 1049.25],
  ['94303 (Palo Alto)', 726, 726, 937.75, 738.50, 738.50, 1054.20, 736.60, 784.50, 817, 874.50, 910, 1036],
  ['95056 (Santa Clara)', 701, 701, 912.75, 738.50, 738.50, 1029.20, 711.60, 759.50, 817, 874.50, 885, 1011],
];

// Note: Column headers reflect the original price-list structure.
// "15yd GD" and "25yd GD" are legacy tier labels from the META 2026 rate card.
// Canonical public sizes are 5/8/10/20/30/40/50 — these labels are internal only.
const HEADERS = [
  'Tier', '8yd CS', '8yd CC', '8yd Mix', '10yd CS', '10yd CC', '10yd Mix',
  '10yd GD', '15yd GD', '20yd GD', '25yd GD', '30yd GD', '40yd GD',
];

export function downloadPriceListPdf() {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Calsan — Price List META 2026', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 25);

  // Format currency
  const fmt = (v: number | string) => typeof v === 'number' ? `$${v.toFixed(2)}` : v;
  const fmtRow = (row: (string | number)[]) => row.map(fmt);

  // Main table
  autoTable(doc, {
    startY: 30,
    head: [HEADERS],
    body: PRICE_DATA.map(fmtRow),
    theme: 'grid',
    headStyles: { fillColor: [15, 76, 58], fontSize: 8, halign: 'center' },
    bodyStyles: { fontSize: 7.5, halign: 'center' },
    columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  });

  // Overrides section
  const finalY = (doc as any).lastAutoTable?.finalY ?? 120;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ZIP Code Overrides', 14, finalY + 10);

  autoTable(doc, {
    startY: finalY + 14,
    head: [HEADERS],
    body: OVERRIDES.map(fmtRow),
    theme: 'grid',
    headStyles: { fillColor: [100, 100, 100], fontSize: 8, halign: 'center' },
    bodyStyles: { fontSize: 7.5, halign: 'center' },
    columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  });

  // Notes
  const finalY2 = (doc as any).lastAutoTable?.finalY ?? 170;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  const notes = [
    'CS = Clean Soil  |  CC = Clean Concrete  |  Mix = Mixed Soil  |  GD = General Debris',
    '8yd: 1 ton included  |  10yd: 2 tons included  |  15-40yd: 4 tons included',
    'Overage: $165/ton  |  Extra days: $35/day  |  Standard rental: 7 days',
  ];
  notes.forEach((n, i) => doc.text(n, 14, finalY2 + 8 + i * 5));

  doc.save('Calsan_Price_List_META_2026.pdf');
}
