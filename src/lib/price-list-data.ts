// Official Price List Data - META 2026 v2 (ZIP-Code Based, updated)
// Source: Lista_de_Precios_Actual_CALSAN (provided 2026-05)
// Prices include delivery, pickup, taxes, 7 rental business days
//
// Each row has 13 columns:
// [0] 5GD   = 5yd General Debris
// [1] 8Cln  = 8yd Clean (Concrete OR Soil — same price)
// [2] 8Mix  = 8yd Mixed Soil
// [3] 8GD   = 8yd General Debris
// [4] 10Cln = 10yd Clean (Concrete OR Soil — same price)
// [5] 10Mix = 10yd Mixed Soil
// [6] 10GD  = 10yd General Debris
// [7] 15GD  = 15yd General Debris
// [8] 20GD  = 20yd General Debris
// [9] 25GD  = 25yd General Debris
// [10] 30GD = 30yd General Debris
// [11] 40GD = 40yd General Debris
// [12] 50GD = 50yd General Debris

type ZipPriceRow = [number, number, number, number, number, number, number, number, number, number, number, number, number];

// Price groups for compactness

const GA: ZipPriceRow = [481.6, 571, 782.75, 511.6, 608.5, 899.2, 581.6, 629.5, 687, 744.5, 755, 881, 1051];
const GB: ZipPriceRow = [501.6, 591, 802.75, 531.6, 628.5, 919.2, 601.6, 649.5, 707, 764.5, 775, 958.4, 1128.4];
const GBb: ZipPriceRow = [501.6, 591, 802.75, 531.6, 628.5, 919.2, 601.6, 609.5, 667, 764.5, 775, 958.4, 1128.4];
const GC: ZipPriceRow = [561.6, 651, 862.75, 591.6, 688.5, 979.2, 661.6, 709.5, 767, 824.5, 835, 961, 1131];
const GD: ZipPriceRow = [558.25, 652.5, 882.5, 588.25, 721.5, 966, 658.25, 715.75, 773.25, 830.75, 911.25, 1049.25, 1219.25];
const GE: ZipPriceRow = [586.6, 676, 887.75, 616.6, 713.5, 1004.2, 686.6, 734.5, 792, 849.5, 860, 986, 1156];
const GF: ZipPriceRow = [602.5, 697.25, 907.25, 632.5, 760.25, 998.87, 702.5, 755, 807.5, 860, 933.5, 1059.5, 1229.5];
const GG: ZipPriceRow = [611.6, 701, 887.75, 641.6, 738.5, 1029.2, 711.6, 759.5, 817, 874.5, 885, 1011, 1181];
const GH: ZipPriceRow = [636.6, 726, 937.75, 666.6, 763.5, 1054.2, 736.6, 784.5, 842, 899.5, 910, 1036, 1206];
const GI: ZipPriceRow = [711.6, 801, 1012.75, 741.6, 838.5, 1129.2, 811.6, 859.5, 917, 974.5, 985, 1111, 1281];
const GJ: ZipPriceRow = [712.75, 807.5, 1017.5, 742.75, 870.5, 1101.5, 812.75, 865.25, 917.75, 970.25, 1043.75, 1169.75, 1339.75];

// Per-ZIP special overrides

const G_94662: ZipPriceRow = [501.6, 591, 802.75, 531.6, 628.5, 919.2, 601.6, 649.5, 707, 764.5, 775, 901, 1071];
const G_94557: ZipPriceRow = [558.25, 652.5, 882.5, 588.25, 721.5, 966, 658.25, 649.5, 773.25, 830.75, 911.25, 1049.25, 1219.25];
const G_95056: ZipPriceRow = [611.6, 701, 912.75, 641.6, 738.5, 1029.2, 711.6, 759.5, 817, 874.5, 885, 1011, 1181];

function buildZipMap(): Record<string, ZipPriceRow> {
  const m: Record<string, ZipPriceRow> = {};
  const assign = (zips: string[], row: ZipPriceRow) => { for (const z of zips) m[z] = row; };

  // Group GA
  assign([
    '94501','94502','94577','94578','94579','94580','94601','94602','94603','94604',
    '94605','94606','94607','94608','94609','94610','94611','94612','94613','94614',
    '94615','94617','94618','94619','94620','94621','94622','94623','94624','94649',
    '94659','94660','94661','94666','94701','94703','94704',
  ], GA);

  // Group GB
  assign([
    '94104','94105','94119','94120','94130','94137','94145','94516','94540','94541',
    '94542','94544','94545','94552','94563','94702','94705','94706','94707','94709',
    '94710','94712','94720','94850',
  ], GB);

  // Group GBb
  assign([
    '94543','94546',
  ], GBb);

  // Group GC
  assign([
    '95002','95035','95036','95050','95051','95052','95053','95054','95101','95103',
    '95106','95109','95110','95112','95115','95116','95126','95128','95132','95133',
    '95134','95150','95152','95156','95159','95164','95173','95190','95191','95192',
    '95194',
  ], GC);

  // Group GD
  assign([
    '94102','94103','94107','94108','94109','94110','94111','94114','94115','94117',
    '94118','94122','94123','94124','94125','94126','94129','94133','94134','94139',
    '94140','94141','94142','94143','94144','94146','94147','94151','94158','94159',
    '94160','94161','94163','94164','94172','94177','94188','94530','94538','94549',
    '94556','94566','94570','94575','94587','94708','94801','94802','94804','94805',
    '94807','94808',
  ], GD);

  // Group GE
  assign([
    '94023','94035','94039','94040','94041','94042','94043','94085','94086','94087',
    '94088','94089','95009','95011','95013','95014','95015','95030','95032','95055',
    '95071','95111','95113','95117','95118','95121','95122','95123','95124','95125',
    '95127','95129','95130','95136','95139','95148','95153','95154','95155','95157',
    '95158','95170','95172','95193','95196',
  ], GE);

  // Group GF
  assign([
    '94002','94005','94014','94015','94016','94017','94030','94080','94083','94112',
    '94116','94121','94127','94128','94131','94132','94402','94403','94404','94507',
    '94518','94519','94521','94522','94523','94524','94525','94526','94527','94528',
    '94529','94536','94537','94539','94547','94555','94560','94564','94568','94572',
    '94582','94583','94588','94595','94596','94597','94598','94803','94806','94820',
    '94901','94904','94912','94914','94925','94939','94957','94960','94964','94974',
    '94976','94977','94979',
  ], GF);

  // Group GG
  assign([
    '94022','94024','94025','94026','94028','94063','94064','94302','94304','94305',
    '94306','94309','94947','94966','95008','95033','95070','95119','95120','95131',
    '95135','95138','95160','95161',
  ], GG);

  // Group GH
  assign([
    '94061','94065','94066','94070','94301',
  ], GH);

  // Group GI
  assign([
    '94511',
  ], GI);

  // Group GJ
  assign([
    '94010','94011','94018','94019','94027','94037','94038','94044','94062','94303',
    '94401','94497','94503','94505','94506','94509','94510','94513','94514','94517',
    '94520','94531','94533','94534','94548','94550','94551','94553','94558','94559',
    '94561','94565','94569','94581','94585','94586','94589','94590','94591','94592',
    '94903','94913','94915','94920','94930','94933','94938','94941','94942','94945',
    '94946','94948','94949','94952','94954','94955','94963','94965','94970','94973',
    '94978','94998','94999','95037','95108','95151','95416','95433','95476','95487',
  ], GJ);

  // Per-ZIP special overrides
  m['94662'] = G_94662;
  m['94557'] = G_94557;
  m['95056'] = G_95056;

  return m;
}

const ZIP_PRICES = buildZipMap();

// Column indices for ZIP lookup (13 columns)
// [0]5GD [1]8Cln [2]8Mix [3]8GD [4]10Cln [5]10Mix [6]10GD [7]15GD [8]20GD [9]25GD [10]30GD [11]40GD [12]50GD

function getZipColumnIndex(sizeYd: number, materialCategory: string): number | null {
  const mat = materialCategory.toUpperCase();
  const isCleanSoil = mat.includes('CLEAN_SOIL') || mat.includes('CLEAN SOIL') || mat === 'SOIL';
  const isCleanConcrete = mat.includes('CLEAN_CONCRETE') || mat.includes('CLEAN CONCRETE') || mat === 'CONCRETE';
  const isClean = isCleanSoil || isCleanConcrete;
  const isMixed = mat.includes('MIX');
  const isHeavy = isClean || mat === 'HEAVY' || mat.includes('DEBRIS_HEAVY');

  switch (sizeYd) {
    case 5:
      // 5yd: general debris only
      return 0;
    case 8:
      if (isClean) return 1;       // Clean concrete OR soil — same price
      if (isMixed) return 2;
      if (isHeavy) return 1;       // default heavy to clean
      return 3;                    // general debris (separate column)
    case 10:
      if (isClean) return 4;
      if (isMixed) return 5;
      if (isHeavy) return 4;
      return 6;                    // general debris
    case 15: return 7;
    case 20: return 8;
    case 25: return 9;
    case 30: return 10;
    case 40: return 11;
    case 50: return 12;
    default: return null;
  }
}

/**
 * Look up the customer price by ZIP code from the official price list.
 * Returns the exact price for a given ZIP, dumpster size, and material category.
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
    const sizes = [5, 8, 10, 15, 20, 25, 30, 40, 50];
    const closest = sizes.reduce((prev, curr) =>
      Math.abs(curr - sizeYd) < Math.abs(prev - sizeYd) ? curr : prev
    );
    colIdx = getZipColumnIndex(closest, materialCategory);
    if (colIdx === null) return { price: 0, zipFound: true, zip };
  }

  const price = row[colIdx];
  if (!price || price === 0) {
    const fallbackIdx = getZipColumnIndex(sizeYd, 'GENERAL');
    if (fallbackIdx !== null && row[fallbackIdx] && row[fallbackIdx] > 0) {
      return { price: row[fallbackIdx], zipFound: true, zip };
    }
  }

  return { price: price || 0, zipFound: true, zip };
}

// ─── Legacy city-based lookup (kept for backward compatibility) ───
// Updated to include 5yd, 8GD and 50yd columns.
// Row order: [5GD, 8Cln, 8Mix, 8GD, 10Cln, 10Mix, 10GD, 15GD, 20GD, 25GD, 30GD, 40GD, 50GD]

const CITY_GROUP: Record<string, ZipPriceRow> = {
  'alameda': GA, 'emeryville': GA, 'piedmont': GA, 'san leandro': GA, 'san lorenzo': GA, 'oakland': GA,
  'albany': GB, 'berkeley': GB, 'kensington': GB,
  'castro valley': GBb, 'hayward': GB,
  'san francisco': GD,
  'el cerrito': GD, 'lafayette': GD, 'moraga': GD, 'richmond': GD,
  'milpitas': GC, 'alviso': GC, 'santa clara': GC, 'san jose': GC,
  'cupertino': GE, 'mountain view': GE, 'sunnyvale': GE,
  'fremont': GD,
  'concord': GF, 'daly city': GF, 'dublin': GF, 'foster city': GF, 'walnut creek': GF, 'south san francisco': GF,
  'menlo park': GG, 'redwood city': GG, 'palo alto': GG, 'san mateo': GF,
  'livermore': GJ, 'napa': GJ, 'vallejo': GJ, 'novato': GJ,
  'pittsburg': GJ, 'antioch': GJ, 'martinez': GJ,
  'hillsborough': GH, 'san bruno': GH, 'san carlos': GH,
};

/** Available dumpster sizes in the price list */
export const PRICE_LIST_SIZES = [5, 8, 10, 15, 20, 25, 30, 40, 50] as const;

/** Included tonnage per size (general debris only; heavy = flat fee) */
export const INCLUDED_TONS: Record<number, number> = {
  5: 0.25,
  8: 0.5,
  10: 1,
  15: 1.5,
  20: 2,
  25: 2.5,
  30: 3,
  40: 4,
  50: 5,
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

  let row = CITY_GROUP[normalizedCity];
  let cityUsed = normalizedCity;
  let cityFound = !!row;

  if (!row) {
    const match = Object.keys(CITY_GROUP).find(
      k => normalizedCity.includes(k) || k.includes(normalizedCity)
    );
    if (match) {
      row = CITY_GROUP[match];
      cityUsed = match;
      cityFound = true;
    }
  }

  if (!row) {
    row = CITY_GROUP['oakland'];
    cityUsed = 'oakland';
  }

  let colIdx = getZipColumnIndex(sizeYd, materialCategory);
  if (colIdx === null) {
    const closest = PRICE_LIST_SIZES.reduce((prev, curr) =>
      Math.abs(curr - sizeYd) < Math.abs(prev - sizeYd) ? curr : prev
    );
    colIdx = getZipColumnIndex(closest, materialCategory);
    if (colIdx === null) return { price: 0, cityFound, cityUsed };
  }

  return { price: row[colIdx], cityFound, cityUsed };
}

/** Get all available city names in the price list */
export function getPriceListCities(): string[] {
  return Object.keys(CITY_GROUP).sort();
}

/** Get all ZIP codes in the price list */
export function getPriceListZips(): string[] {
  return Object.keys(ZIP_PRICES).sort();
}
