-- Expand service_type check constraint to support new campaign types
ALTER TABLE public.ads_campaigns DROP CONSTRAINT ads_campaigns_service_type_check;
ALTER TABLE public.ads_campaigns ADD CONSTRAINT ads_campaigns_service_type_check
  CHECK (service_type = ANY (ARRAY[
    'dumpster_rental', 'material_disposal', 'heavy_hauling',
    'contractor_program', 'heavy_material', 'same_day'
  ]));
