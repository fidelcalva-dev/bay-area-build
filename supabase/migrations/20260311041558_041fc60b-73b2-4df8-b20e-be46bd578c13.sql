
ALTER TABLE public.disposal_sites DROP CONSTRAINT disposal_sites_type_check;
ALTER TABLE public.disposal_sites ADD CONSTRAINT disposal_sites_type_check 
  CHECK (type = ANY (ARRAY['transfer_station','recycling','landfill','composting','clean_fill']));
