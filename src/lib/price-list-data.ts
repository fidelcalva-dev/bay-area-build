// Official Price List Data - META 2026
// Source: Lista de precios para Calsan Dumpsters Pro
// Prices include delivery, pickup, taxes, 7 rental business days
//
// Structure per city: [8yd_heavy, 8yd_mix, 10yd_heavy, 10yd_mix, 15yd, 20yd, 25yd, 30yd, 40yd]
// - 8yd_heavy = 8yd Clean Soil / Clean Concrete (1 ton included)
// - 8yd_mix   = 8yd Mix Load (1.5 tons included)
// - 10yd_heavy = 10yd Clean Dirt / Clean Concrete (2–2.5 tons included)
// - 10yd_mix   = 10yd Mix General Debris (3 tons included)
// - 15yd–40yd  = General Debris (4 tons included)

type PriceRow = [number, number, number, number, number, number, number, number, number];

const PRICE_LIST: Record<string, PriceRow> = {
  // -- Tier A (closest to yard) --
  'alameda':            [571, 783, 609, 899, 582, 630, 687, 745, 755],
  'emeryville':         [571, 783, 609, 899, 582, 630, 687, 745, 755],
  'piedmont':           [571, 783, 609, 899, 582, 630, 687, 745, 755],
  'san leandro':        [571, 783, 609, 899, 582, 630, 687, 745, 755],
  'san lorenzo':        [571, 783, 609, 899, 582, 630, 687, 745, 755],
  'oakland':            [572, 783, 609, 900, 582, 630, 687, 745, 755],

  // -- Tier B --
  'albany':             [591, 803, 629, 919, 602, 650, 707, 765, 775],
  'berkeley':           [591, 804, 631, 918, 601, 647, 704, 765, 781],
  'canyon':             [591, 803, 629, 919, 602, 650, 707, 765, 775],
  'castro valley':      [591, 803, 629, 919, 602, 630, 687, 765, 775],
  'orinda':             [591, 803, 629, 919, 602, 650, 707, 765, 775],
  'uc berkeley':        [591, 803, 629, 919, 602, 650, 707, 765, 775],

  // -- Tier C --
  'hayward':            [598, 812, 639, 924, 608, 644, 701, 772, 790],

  // -- Tier D --
  'kensington':         [612, 829, 660, 935, 620, 658, 716, 787, 820],
  'union city':         [612, 833, 665, 935, 620, 673, 730, 788, 833],

  // -- Tier E --
  'san francisco':      [650, 875, 714, 964, 650, 700, 757, 815, 825],

  // -- Tier F --
  'el cerrito':         [653, 883, 722, 966, 658, 716, 773, 831, 900],
  'lafayette':          [653, 883, 722, 966, 658, 716, 773, 831, 900],
  'moraga':             [653, 883, 722, 966, 658, 716, 773, 831, 900],
  'mount eden':         [653, 883, 722, 966, 658, 716, 773, 831, 900],
  'north richmond':     [653, 883, 722, 966, 658, 716, 773, 831, 900],
  'point richmond':     [653, 883, 722, 966, 658, 716, 773, 831, 900],

  // -- Tier G --
  'milpitas':           [651, 863, 689, 979, 662, 710, 767, 825, 835],
  'alviso':             [651, 863, 689, 979, 662, 710, 767, 825, 835],

  // -- Tier H --
  'richmond':           [660, 882, 724, 971, 670, 718, 775, 833, 843],

  // -- Tier I --
  'santa clara':        [662, 873, 699, 990, 672, 720, 777, 835, 845],
  'san jose':           [673, 882, 711, 1000, 683, 731, 788, 846, 856],

  // -- Tier J --
  'coyote':             [676, 888, 714, 1004, 687, 735, 792, 850, 860],
  'cupertino':          [676, 888, 714, 1004, 687, 735, 792, 850, 860],
  'moffett field':      [676, 888, 714, 1004, 687, 735, 792, 850, 860],
  'monte sereno':       [676, 888, 714, 1004, 687, 735, 792, 850, 860],
  'monte vista':        [676, 888, 714, 1004, 687, 735, 792, 850, 860],
  'mountain view':      [676, 888, 714, 1004, 687, 735, 792, 850, 860],
  'sunnyvale':          [676, 888, 714, 1004, 687, 735, 792, 850, 860],

  // -- Tier K --
  'fremont':            [679, 897, 745, 986, 685, 739, 799, 848, 925],
  'pleasanton':         [682, 899, 747, 988, 692, 740, 797, 855, 865],
  'campbell':           [684, 888, 722, 1013, 695, 743, 800, 858, 868],
  'los gatos':          [684, 888, 722, 1013, 695, 743, 800, 858, 868],
  'saratoga':           [689, 888, 726, 1017, 699, 747, 804, 862, 872],
  'los altos':          [693, 888, 730, 1021, 703, 751, 808, 866, 876],

  // -- Tier L --
  'alamo':              [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'belmont':            [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'brisbane':           [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'broadmoor':          [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'colma':              [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'corte madera':       [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'crockett':           [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'daly city':          [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'diablo':             [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'dublin':             [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'el sobrante':        [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'foster city':        [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'greenbrae':          [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'hercules':           [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'larkspur':           [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'millbrae':           [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'newark':             [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'pinole':             [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'pleasant hill':      [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'rodeo':              [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'ross':               [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'san anselmo':        [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'san pablo':          [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'san ramon':          [697, 907, 760, 999, 703, 755, 808, 860, 934],
  'south san francisco':[697, 907, 760, 999, 703, 755, 808, 860, 934],
  'walnut creek':       [697, 907, 760, 999, 703, 755, 808, 860, 934],

  // -- Tier M --
  'los altos hills':    [701, 888, 739, 1029, 712, 760, 817, 875, 885],
  'portola valley':     [701, 888, 739, 1029, 712, 760, 817, 875, 885],
  'sausalito':          [701, 888, 739, 1029, 712, 760, 817, 875, 885],
  'west menlo park':    [701, 888, 739, 1029, 712, 760, 817, 875, 885],

  // -- Tier N --
  'palo alto':          [708, 902, 742, 1036, 718, 766, 823, 881, 891],
  'concord':            [711, 921, 774, 1012, 716, 769, 821, 874, 947],

  // -- Tier O --
  'east palo alto':     [726, 938, 739, 1054, 737, 785, 817, 875, 1155],
  'hillsborough':       [726, 938, 764, 1054, 737, 785, 842, 900, 910],
  'san bruno':          [726, 938, 764, 1054, 737, 785, 842, 900, 910],
  'san carlos':         [726, 938, 764, 1054, 737, 785, 842, 900, 910],
  'menlo park':         [728, 920, 772, 1047, 738, 786, 843, 901, 911],
  'redwood city':       [732, 934, 775, 1054, 742, 790, 847, 905, 915],

  // -- Tier P --
  'san mateo':          [741, 951, 804, 1040, 751, 799, 856, 914, 924],

  // -- Tier Q --
  'danville':           [752, 962, 815, 1050, 758, 810, 863, 915, 989],
  'kentfield':          [752, 962, 815, 1050, 758, 810, 863, 915, 989],

  // -- Tier R --
  'san rafael':         [763, 973, 826, 1060, 773, 825, 878, 930, 1004],
  'stanford':           [767, 978, 817, 1067, 775, 825, 880, 935, 977],
  'woodside':           [767, 978, 817, 1067, 775, 825, 880, 935, 977],

  // -- Tier S --
  'morgan hill':        [772, 974, 827, 1077, 782, 834, 887, 939, 1013],
  'novato':             [786, 992, 844, 1087, 796, 848, 901, 953, 1027],

  // -- Tier T --
  'bethel island':      [801, 1013, 839, 1129, 812, 860, 917, 975, 985],

  // -- Tier U (farthest / most expensive) --
  'american canyon':    [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'antioch':            [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'atherton':           [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'bay point':          [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'belvedere':          [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'benicia':            [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'blackhawk':          [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'brentwood':          [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'burlingame':         [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'byron':              [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'clayton':            [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'discovery bay':      [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'el granada':         [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'fairfax':            [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'fairfield':          [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'half moon bay':      [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'knightsen':          [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'livermore':          [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'martinez':           [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'mill valley':        [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'montara':            [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'moss beach':         [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'muir beach':         [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'napa':               [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'nicasio':            [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'oakley':             [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'pacheco':            [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'pacifica':           [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'petaluma':           [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'pittsburg':          [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'port costa':         [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'san geronimo':       [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'sonoma':             [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'stinson beach':      [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'suisun city':        [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'sunol':              [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'tiburon':            [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'vallejo':            [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'vineburg':           [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
  'woodacre':           [808, 1018, 871, 1102, 813, 865, 918, 970, 1044],
};

// Column index mapping:
// [0] 8yd heavy, [1] 8yd mix, [2] 10yd heavy, [3] 10yd mix,
// [4] 15yd,      [5] 20yd,    [6] 25yd,       [7] 30yd,      [8] 40yd

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
  8: 1,    // 1 ton for heavy, 1.5 for mix — simplified to 1
  10: 2,   // 2–3 tons depending on material
  15: 4,
  20: 4,
  25: 4,
  30: 4,
  40: 4,
};

/**
 * Look up the customer price from the official price list.
 * Returns the price for a given city, dumpster size, and material category.
 * Falls back to Oakland pricing if city not found.
 */
export function getPriceFromList(
  city: string,
  sizeYd: number,
  materialCategory: string
): { price: number; cityFound: boolean; cityUsed: string } {
  const normalizedCity = city.trim().toLowerCase();

  // Try exact match first
  let row = PRICE_LIST[normalizedCity];
  let cityUsed = normalizedCity;
  let cityFound = !!row;

  // Try partial match if no exact match
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

  // Fallback to Oakland
  if (!row) {
    row = PRICE_LIST['oakland'];
    cityUsed = 'oakland';
  }

  const sizeMap = SIZE_INDEX[sizeYd];
  if (!sizeMap) {
    // Size not in price list — interpolate or use closest
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
