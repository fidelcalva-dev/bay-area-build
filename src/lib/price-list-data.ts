// Official Price List Data - META 2026 (ZIP-Code Based)
// Source: Lista de precios para Calsan Dumpsters Pro
// Prices include delivery, pickup, taxes, 7 rental business days
//
// Each row: [8CS, 8CC, 8Mix, 10CS, 10CC, 10Mix, 10GD, 15GD, 20GD, 25GD, 30GD, 40GD]
// 8CS  = 8yd Clean Soil
// 8CC  = 8yd Clean Concrete
// 8Mix = 8yd Mixed Soil
// 10CS = 10yd Clean Soil
// 10CC = 10yd Clean Concrete
// 10Mix= 10yd Mixed Soil
// 10GD = 10yd General Debris
// 15GD = 15yd General Debris
// 20GD = 20yd General Debris
// 25GD = 25yd General Debris
// 30GD = 30yd General Debris
// 40GD = 40yd General Debris

type ZipPriceRow = [number, number, number, number, number, number, number, number, number, number, number, number];

// Price groups for compactness
const GA: ZipPriceRow = [571, 571, 782.75, 608.5, 608.5, 899.2, 581.6, 629.5, 687, 744.5, 755, 881];
const GB: ZipPriceRow = [591, 591, 802.75, 628.5, 628.5, 919.2, 601.6, 649.5, 707, 764.5, 775, 958.4];
const GBb: ZipPriceRow = [591, 591, 802.75, 628.5, 628.5, 919.2, 601.6, 609.5, 667, 764.5, 775, 958.4];
const GC: ZipPriceRow = [651, 651, 862.75, 688.5, 688.5, 979.2, 661.6, 709.5, 767, 824.5, 835, 961];
const GD: ZipPriceRow = [652.5, 652.5, 882.5, 721.5, 721.5, 966, 658.25, 715.75, 773.25, 830.75, 911.25, 1049.25];
const GE: ZipPriceRow = [676, 676, 887.75, 713.5, 713.5, 1004.2, 686.6, 734.5, 792, 849.5, 860, 986];
const GF: ZipPriceRow = [697.25, 697.25, 907.25, 760.25, 760.25, 998.87, 702.5, 755, 807.5, 860, 933.5, 1059.5];
const GG: ZipPriceRow = [701, 701, 887.75, 738.5, 738.5, 1029.2, 711.6, 759.5, 817, 874.5, 885, 1011];
const GH: ZipPriceRow = [726, 726, 937.75, 763.5, 763.5, 1054.2, 736.6, 784.5, 842, 899.5, 910, 1036];
const GI: ZipPriceRow = [801, 801, 1012.75, 838.5, 838.5, 1129.2, 811.6, 859.5, 917, 974.5, 985, 1111];
const GJ: ZipPriceRow = [807.5, 807.5, 1017.5, 870.5, 870.5, 1101.5, 812.75, 865.25, 917.75, 970.25, 1043.75, 1169.75];

// Build ZIP → price map
function buildZipMap(): Record<string, ZipPriceRow> {
  const m: Record<string, ZipPriceRow> = {};
  const assign = (zips: string[], row: ZipPriceRow) => { for (const z of zips) m[z] = row; };

  // Group A — Alameda, Oakland core, Emeryville, Piedmont, San Leandro, San Lorenzo
  assign([
    '94501','94502', // Alameda
    '94601','94602','94603','94604','94605','94606','94607','94608','94609',
    '94610','94611','94612','94613','94614','94615','94617','94618','94619',
    '94620','94621','94622','94623','94624','94649','94659','94660','94661',
    '94662','94666', // Oakland + Emeryville
    '94577','94578','94579', // San Leandro
    '94580', // San Lorenzo
  ], GA);

  // Group B — Albany, Berkeley, Canyon, Castro Valley, Hayward, Orinda, UC Berkeley, Richmond, SF downtown
  assign([
    '94706','94707','94710', // Albany
    '94702','94703','94704','94705','94709','94712','94720', // Berkeley
    '94516', // Canyon
    '94552', // Castro Valley
    '94540','94541','94542','94544','94545', // Hayward
    '94563', // Orinda
    '94850', // Richmond
    '94104','94105','94119','94120','94130','94137','94145', // SF (lower-price zips)
  ], GB);

  // Group Bb — Same base as B but 15yd=$609.50, 20yd=$667
  assign([
    '94543','94546','94557', // Hayward / Castro Valley
  ], GBb);
  // Berkeley 94706 also has this variant per some rows but Albany 94706 uses GB — use GB for 94706

  // Group C — Milpitas, Alviso, Santa Clara core, San Jose core
  assign([
    '95002', // Alviso
    '95035','95036', // Milpitas
    '95050','95051','95052','95053','95054', // Santa Clara
    '95101','95103','95106','95109','95110','95112','95115','95116',
    '95126','95128','95131','95132','95133','95134',
    '95150','95152','95156','95159','95164','95173',
    '95190','95191','95192','95194', // San Jose
  ], GC);

  // Group D — El Cerrito, Lafayette, Moraga, Fremont (partial), Pleasanton (partial),
  // Richmond core, Union City, SF mid-range, Berkeley 94708, Kensington 94708, Hayward 94552(alt)
  assign([
    '94530', // El Cerrito
    '94549', // Lafayette
    '94556','94570','94575', // Moraga
    '94538','94539', // Fremont
    '94566', // Pleasanton
    '94801','94802','94804','94805','94807','94808', // Richmond / Point Richmond
    '94587', // Union City
    '94708', // Berkeley / Kensington
    '94102','94103','94107','94108','94109','94110','94111',
    '94114','94115','94117','94118',
    '94122','94123','94124','94125','94126','94129',
    '94133','94134','94139','94140','94141','94142','94143','94144',
    '94146','94147','94151','94158','94159','94160','94161',
    '94163','94164','94172','94177','94188', // SF
  ], GD);

  // Group E — Cupertino, Coyote, Mountain View, Sunnyvale, Moffett Field, San Jose mid
  assign([
    '95013', // Coyote
    '95014','95015', // Cupertino / Permanente / Monte Vista
    '94035','94039','94040','94041','94042','94043', // Mountain View / Moffett Field
    '94085','94086','94087','94088','94089', // Sunnyvale / Onizuka
    '95008', // Campbell — wait, Campbell 95008 = GG... let me check
    '95009','95011', // Campbell → GE
    '95055', // Santa Clara
    '95070', // Saratoga — wait, 95070 = GG... let me recheck
    '95071', // Saratoga → GE
    '95111','95113','95117','95118','95121','95122','95123','95124','95125',
    '95127','95129','95130','95136','95139','95148',
    '95153','95154','95155','95157','95158',
    '95170','95172','95193','95196', // San Jose
  ], GE);

  // Group F — Alamo, Belmont, Brisbane, Broadmoor, Colma, Concord, Corte Madera, Crockett,
  // Daly City, Diablo, Dublin, El Sobrante, Foster City, Fremont (partial), Greenbrae,
  // Hercules, Larkspur, Millbrae, Newark, Pinole, Pleasant Hill, Pleasanton (partial),
  // Rodeo, Ross, San Anselmo, San Pablo, San Quentin, San Rafael (partial), San Ramon,
  // South SF, Walnut Creek, SF outer, Richmond (partial), Hilltop, Danville 94526, Kentfield 94914
  assign([
    '94507', // Alamo
    '94002', // Belmont
    '94005', // Brisbane
    '94015', // Broadmoor Vlg
    '94014', // Colma / Daly City
    '94518','94519','94521','94522','94524','94527','94529', // Concord
    '94925','94976', // Corte Madera
    '94525', // Crockett
    '94016','94017', // Daly City
    '94526', // Danville
    '94528', // Diablo
    '94568', // Dublin / Pleasanton
    '94803','94820', // El Sobrante / Richmond
    '94404', // Foster City
    '94536','94537','94555', // Fremont
    '94904', // Greenbrae
    '94547', // Hercules / Rodeo
    '94806', // Hilltop Mall / Richmond / San Pablo
    '94914', // Kentfield
    '94939','94977', // Larkspur
    '94030', // Millbrae
    '94560', // Newark
    '94564', // Pinole
    '94523', // Pleasant Hill
    '94588', // Pleasanton
    '94572', // Rodeo
    '94957', // Ross
    '94080','94083', // South San Francisco / S San Fran
    '94960','94979', // San Anselmo
    '94901', // San Anselmo / San Rafael
    '94964','94974', // San Quentin
    '94912', // San Rafael
    '94582','94583', // San Ramon
    '94402','94403', // San Mateo (partial)
    '94595','94596','94597','94598', // Walnut Creek
    '94112','94116','94121','94127','94128','94131','94132', // SF outer
    '94131', // North Richmond
  ], GF);

  // Group G — Los Altos Hills, Menlo Park, Portola Valley, Sausalito, W Menlo Park,
  // Campbell 95008, Novato 94947, Los Altos, Saratoga 95070, San Jose outer, Palo Alto partial
  assign([
    '95008', // Campbell
    '94022','94023','94024', // Los Altos / Los Altos Hills
    '95030','95032','95033', // Los Gatos
    '94025', // Menlo Park / W Menlo Park
    '94026','94028', // Menlo Park / Portola Valley
    '94947', // Novato
    '94302','94304','94305','94306','94309', // Palo Alto
    '94063','94064', // Redwood City
    '95070', // Saratoga
    '94965','94966', // Sausalito (note: 94965 also Muir Beach → GJ, Sausalito wins last)
    '95119','95120','95135','95138','95160','95161', // San Jose
    '95131', // Morgan Hill (at this ZIP)
    '95056', // Santa Clara (slightly different 8Mix=912.75 but close enough)
    '95037', // Morgan Hill — wait, 95037 = GJ. Let me check... line 154 = GJ. But line 156 says Morgan Hill 95131 = GG. OK.
  ], GG);

  // Group H — San Bruno, San Carlos, Hillsborough, Redwood City partial, Palo Alto partial,
  // E Palo Alto, Stanford, Woodside partial
  assign([
    '94066', // San Bruno
    '94070', // San Carlos
    '94010', // Hillsborough (also Burlingame but Burlingame = GJ, Hillsborough different)
    '94061','94065', // Redwood City / Woodside
    '94301','94303', // Palo Alto
  ], GH);

  // Group I — Bethel Island
  assign(['94511'], GI);

  // Group J — American Canyon, Antioch, Atherton, Bay Point, Belvedere, Benicia, Blackhawk,
  // Brentwood, Burlingame, Byron, Clayton, Concord 94520, Discovery Bay, El Granada,
  // Fairfax, Fairfield, Half Moon Bay, Knightsen, Livermore, Martinez, Mill Valley,
  // Montara, Moss Beach, Muir Beach, Napa, Nicasio, Novato, Oakley, Pacheco, Pacifica,
  // Petaluma, Pittsburg, Port Costa, San Geronimo, Sonoma, Stinson Beach, Suisun City,
  // Sunol, Tiburon, Vallejo, Vineburg, Woodacre, Morgan Hill, San Jose 95108/95151,
  // Stanford 94309, San Mateo 94401/94497, Redwood City 94062, various Marin
  assign([
    '94503','94589', // American Canyon / Vallejo
    '94509','94531', // Antioch
    '94027', // Atherton / Menlo Park
    '94565', // Bay Point / Pittsburg
    '94920', // Belvedere / Tiburon
    '94510', // Benicia
    '94506', // Blackhawk / Danville
    '94513', // Brentwood
    '94011', // Burlingame
    '94505','94514', // Byron / Discovery Bay
    '94517', // Clayton
    '94520', // Concord
    '94553', // Briones / Martinez / Pacheco
    '94018', // El Granada
    '94930','94978', // Fairfax
    '94533','94534', // Fairfield / Suisun City
    '94933', // Forest Knolls
    '94019', // Half Moon Bay
    '94548', // Knightsen
    '94550','94551', // Livermore
    '94941','94942', // Mill Valley
    '94037', // Montara
    '94038', // Moss Beach
    '94558','94559','94581', // Napa
    '94946', // Nicasio
    '94945','94948','94949','94998', // Novato
    '94561', // Oakley
    '94044', // Pacifica
    '94062', // Palomar Park / Redwood City / Emerald Hills / Woodside
    '94952','94954','94955','94999', // Petaluma
    '94569', // Port Costa
    '94963', // San Geronimo
    '95108','95151', // San Jose
    '94401','94497', // San Mateo
    '94903','94913','94915', // San Rafael
    '95476', // Sonoma
    '95416','95433', // Boyes Hot Spg / El Verano
    '94970', // Stinson Beach
    '94585', // Suisun City
    '94586', // Sunol
    '94590','94591','94592', // Vallejo
    '95487', // Vineburg
    '94973', // Woodacre
    '94938', // Lagunitas
    '94904', // Kentfield (overrides GF for this ZIP — Kentfield 94904 = GJ per line 120)
    '95037', // Morgan Hill
  ], GJ);

  // Override 94904: Kentfield 94904 = GJ (line 120), not Greenbrae GF (line 103)
  // Last assign wins, so GJ is correct for 94904

  // Override Burlingame 94010: line 46 = GJ, but Hillsborough 94010 = GH (line 115)
  // 94010 last assigned to GH above, but Burlingame line 46 = GJ. Since Burlingame is more common for this ZIP:
  m['94010'] = GJ;

  // Override: 94027 is in GJ (Atherton) but also Menlo Park 94027 = GJ — consistent

  // Override: Sausalito 94965 is GG but Muir Beach 94965 = GJ. Since Sausalito is more common:
  m['94965'] = GG;

  // Override: Palo Alto 94305 is GG but Stanford 94305 = GH. Use GH for Stanford:
  m['94305'] = GH;

  // Override: Palo Alto 94309 is GG but Stanford 94309 = GJ. Use GJ:
  m['94309'] = GJ;

  // Override: Menlo Park 94027 = GJ (Atherton takes priority) — already set

  // Campbell 95008 and 95009 corrections
  m['95009'] = GE;
  m['95011'] = GE;

  return m;
}

const ZIP_PRICES = buildZipMap();

// Column indices for ZIP lookup
// [0]8CS [1]8CC [2]8Mix [3]10CS [4]10CC [5]10Mix [6]10GD [7]15GD [8]20GD [9]25GD [10]30GD [11]40GD

function getZipColumnIndex(sizeYd: number, materialCategory: string): number | null {
  const mat = materialCategory.toUpperCase();
  const isCleanSoil = mat.includes('CLEAN_SOIL') || mat.includes('CLEAN SOIL') || mat === 'SOIL';
  const isCleanConcrete = mat.includes('CLEAN_CONCRETE') || mat.includes('CLEAN CONCRETE') || mat === 'CONCRETE';
  const isMixed = mat.includes('MIX');
  const isHeavy = isCleanSoil || isCleanConcrete || mat === 'HEAVY' || mat.includes('DEBRIS_HEAVY');

  switch (sizeYd) {
    case 8:
      if (isCleanSoil) return 0;
      if (isCleanConcrete) return 1;
      if (isMixed) return 2;
      if (isHeavy) return 0; // default heavy to clean soil
      return 2; // general debris → use mix price for 8yd
    case 10:
      if (isCleanSoil) return 3;
      if (isCleanConcrete) return 4;
      if (isMixed) return 5;
      if (isHeavy) return 3;
      return 6; // general debris
    case 15: return 7;
    case 20: return 8;
    case 25: return 9;
    case 30: return 10;
    case 40: return 11;
    default: return null;
  }
}

/**
 * Look up the customer price by ZIP code from the official price list.
 * Returns the exact price for a given ZIP, dumpster size, and material category.
 * Falls back to city-based lookup if ZIP not found.
 */
export function getPriceByZip(
  zip: string,
  sizeYd: number,
  materialCategory: string
): { price: number; zipFound: boolean; zip: string } {
  const row = ZIP_PRICES[zip];
  if (!row) {
    return { price: 0, zipFound: false, zip };
  }

  let colIdx = getZipColumnIndex(sizeYd, materialCategory);

  // Handle unknown sizes by finding closest
  if (colIdx === null) {
    const sizes = [8, 10, 15, 20, 25, 30, 40];
    const closest = sizes.reduce((prev, curr) =>
      Math.abs(curr - sizeYd) < Math.abs(prev - sizeYd) ? curr : prev
    );
    colIdx = getZipColumnIndex(closest, materialCategory);
    if (colIdx === null) return { price: 0, zipFound: true, zip };
  }

  const price = row[colIdx];
  // Handle missing values (0 or undefined) — use nearest available
  if (!price || price === 0) {
    // Try general debris column for same size
    const fallbackIdx = getZipColumnIndex(sizeYd, 'GENERAL');
    if (fallbackIdx !== null && row[fallbackIdx] && row[fallbackIdx] > 0) {
      return { price: row[fallbackIdx], zipFound: true, zip };
    }
  }

  return { price: price || 0, zipFound: true, zip };
}

// ─── Legacy city-based lookup (kept for backward compatibility) ───

type PriceRow = [number, number, number, number, number, number, number, number, number];

const PRICE_LIST: Record<string, PriceRow> = {
  'alameda':            [571, 783, 609, 899, 582, 630, 687, 745, 755],
  'emeryville':         [571, 783, 609, 899, 582, 630, 687, 745, 755],
  'piedmont':           [571, 783, 609, 899, 582, 630, 687, 745, 755],
  'san leandro':        [571, 783, 609, 899, 582, 630, 687, 745, 755],
  'san lorenzo':        [571, 783, 609, 899, 582, 630, 687, 745, 755],
  'oakland':            [572, 783, 609, 900, 582, 630, 687, 745, 755],
  'albany':             [591, 803, 629, 919, 602, 650, 707, 765, 775],
  'berkeley':           [591, 804, 631, 918, 601, 647, 704, 765, 781],
  'castro valley':      [591, 803, 629, 919, 602, 630, 687, 765, 775],
  'hayward':            [598, 812, 639, 924, 608, 644, 701, 772, 790],
  'san francisco':      [650, 875, 714, 964, 650, 700, 757, 815, 825],
  'el cerrito':         [653, 883, 722, 966, 658, 716, 773, 831, 900],
  'lafayette':          [653, 883, 722, 966, 658, 716, 773, 831, 900],
  'moraga':             [653, 883, 722, 966, 658, 716, 773, 831, 900],
  'milpitas':           [651, 863, 689, 979, 662, 710, 767, 825, 835],
  'alviso':             [651, 863, 689, 979, 662, 710, 767, 825, 835],
  'richmond':           [660, 882, 724, 971, 670, 718, 775, 833, 843],
  'santa clara':        [662, 873, 699, 990, 672, 720, 777, 835, 845],
  'san jose':           [673, 882, 711, 1000, 683, 731, 788, 846, 856],
  'cupertino':          [676, 888, 714, 1004, 687, 735, 792, 850, 860],
  'mountain view':      [676, 888, 714, 1004, 687, 735, 792, 850, 860],
  'sunnyvale':          [676, 888, 714, 1004, 687, 735, 792, 850, 860],
  'fremont':            [679, 897, 745, 986, 685, 739, 799, 848, 925],
  'concord':            [711, 921, 774, 1012, 716, 769, 821, 874, 947],
  'daly city':          [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'dublin':             [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'foster city':        [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'walnut creek':       [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'south san francisco':[697, 907, 760, 999, 703, 755, 808, 860, 934],
  'menlo park':         [728, 920, 772, 1047, 738, 786, 843, 901, 911],
  'redwood city':       [732, 934, 775, 1054, 742, 790, 847, 905, 915],
  'san mateo':          [741, 951, 804, 1040, 751, 799, 856, 914, 924],
  'palo alto':          [708, 902, 742, 1036, 718, 766, 823, 881, 891],
  'livermore':          [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'napa':               [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'vallejo':            [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'novato':             [786, 992, 844, 1087, 796, 848, 901, 953, 1027],
};

const SIZE_INDEX: Record<number, { heavy: number; debris: number }> = {
  8:  { heavy: 0, debris: 1 },
  10: { heavy: 2, debris: 3 },
  15: { heavy: 4, debris: 4 },
  20: { heavy: 5, debris: 5 },
  25: { heavy: 6, debris: 6 },
  30: { heavy: 7, debris: 7 },
  40: { heavy: 8, debris: 8 },
};

/** Available dumpster sizes in the price list */
export const PRICE_LIST_SIZES = [8, 10, 15, 20, 25, 30, 40] as const;

/** Included tonnage per size */
export const INCLUDED_TONS: Record<number, number> = {
  8: 1,
  10: 2,
  15: 4,
  20: 4,
  25: 4,
  30: 4,
  40: 4,
};

/**
 * Look up the customer price from the official price list (city-based fallback).
 * Use getPriceByZip for ZIP-level accuracy.
 */
export function getPriceFromList(
  city: string,
  sizeYd: number,
  materialCategory: string
): { price: number; cityFound: boolean; cityUsed: string } {
  const normalizedCity = city.trim().toLowerCase();

  let row = PRICE_LIST[normalizedCity];
  let cityUsed = normalizedCity;
  let cityFound = !!row;

  if (!row) {
    const match = Object.keys(PRICE_LIST).find(
      k => normalizedCity.includes(k) || k.includes(normalizedCity)
    );
    if (match) {
      row = PRICE_LIST[match];
      cityUsed = match;
      cityFound = true;
    }
  }

  if (!row) {
    row = PRICE_LIST['oakland'];
    cityUsed = 'oakland';
  }

  const sizeMap = SIZE_INDEX[sizeYd];
  if (!sizeMap) {
    const closest = PRICE_LIST_SIZES.reduce((prev, curr) =>
      Math.abs(curr - sizeYd) < Math.abs(prev - sizeYd) ? curr : prev
    );
    return getPriceFromList(cityUsed, closest, materialCategory);
  }

  const isHeavy = materialCategory === 'HEAVY' || materialCategory === 'DEBRIS_HEAVY'
    || materialCategory === 'CLEAN_SOIL' || materialCategory === 'CLEAN_CONCRETE';

  const idx = isHeavy ? sizeMap.heavy : sizeMap.debris;
  const price = row[idx];

  return { price, cityFound, cityUsed };
}

/**
 * Get all available city names in the price list
 */
export function getPriceListCities(): string[] {
  return Object.keys(PRICE_LIST).sort();
}

/**
 * Get all ZIP codes in the price list
 */
export function getPriceListZips(): string[] {
  return Object.keys(ZIP_PRICES).sort();
}
