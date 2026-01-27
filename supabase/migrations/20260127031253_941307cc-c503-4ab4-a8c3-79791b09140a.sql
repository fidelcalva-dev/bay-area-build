-- Update disposal_item_catalog with East Bay-tuned volume_points
-- First, update existing items with correct values

UPDATE public.disposal_item_catalog SET volume_points = 4 WHERE item_code = 'GENERAL_JUNK';
UPDATE public.disposal_item_catalog SET volume_points = 3 WHERE item_code = 'BOXES';
UPDATE public.disposal_item_catalog SET volume_points = 6 WHERE item_code = 'FURNITURE';
UPDATE public.disposal_item_catalog SET volume_points = 4 WHERE item_code = 'APPLIANCES';
UPDATE public.disposal_item_catalog SET volume_points = 6 WHERE item_code = 'MATTRESS';

UPDATE public.disposal_item_catalog SET volume_points = 7 WHERE item_code = 'DRYWALL';
UPDATE public.disposal_item_catalog SET volume_points = 6 WHERE item_code = 'WOOD_FRAMING';
UPDATE public.disposal_item_catalog SET volume_points = 5 WHERE item_code = 'CABINETS';
UPDATE public.disposal_item_catalog SET volume_points = 6 WHERE item_code = 'FLOORING';
UPDATE public.disposal_item_catalog SET volume_points = 8 WHERE item_code = 'ROOFING_SHINGLES';

UPDATE public.disposal_item_catalog SET volume_points = 9 WHERE item_code = 'CONCRETE';
UPDATE public.disposal_item_catalog SET volume_points = 8 WHERE item_code = 'BRICK_TILE';
UPDATE public.disposal_item_catalog SET volume_points = 9 WHERE item_code = 'ASPHALT';
UPDATE public.disposal_item_catalog SET volume_points = 7 WHERE item_code = 'DIRT';
UPDATE public.disposal_item_catalog SET volume_points = 8 WHERE item_code = 'ROCK_GRAVEL';
UPDATE public.disposal_item_catalog SET volume_points = 8 WHERE item_code = 'GRANITE';

UPDATE public.disposal_item_catalog SET volume_points = 5 WHERE item_code = 'CLEAN_WOOD';
UPDATE public.disposal_item_catalog SET volume_points = 6 WHERE item_code = 'WOOD_CHIPS';
UPDATE public.disposal_item_catalog SET volume_points = 4 WHERE item_code = 'METAL';
UPDATE public.disposal_item_catalog SET volume_points = 6 WHERE item_code = 'CARDBOARD';
UPDATE public.disposal_item_catalog SET volume_points = 5 WHERE item_code = 'PLASTIC';

UPDATE public.disposal_item_catalog SET volume_points = 6 WHERE item_code = 'GRASS';
UPDATE public.disposal_item_catalog SET volume_points = 5 WHERE item_code = 'BRANCHES';