-- Phase A: Extend Smart Material Options for HOMEOWNER

-- 1) Add missing project categories for Homeowner
INSERT INTO public.project_categories (category_code, display_name, display_name_es, description, description_es, icon, display_order, is_active)
VALUES 
  ('YARD_CLEANUP', 'Yard Cleanup', 'Limpieza de Jardín', 'Clearing brush, leaves, and yard debris', 'Limpieza de maleza, hojas y desechos del jardín', 'tree-pine', 5, true),
  ('SMALL_CONCRETE_PAVERS', 'Small Concrete/Pavers', 'Concreto Pequeño/Adoquines', 'Removing patio, walkway, or driveway concrete', 'Remoción de concreto de patio, camino o entrada', 'hard-hat', 6, true),
  ('GARAGE_PROPERTY_CLEANOUT', 'Garage/Property Cleanout', 'Limpieza de Garaje/Propiedad', 'Cleaning out garage, shed, or property', 'Limpieza de garaje, cobertizo o propiedad', 'warehouse', 7, true)
ON CONFLICT (category_code) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  display_name_es = EXCLUDED.display_name_es,
  description = EXCLUDED.description,
  description_es = EXCLUDED.description_es,
  icon = EXCLUDED.icon,
  is_active = true;

-- Rename LANDSCAPING to YARD_CLEANUP equivalent or keep both (keep LANDSCAPING for contractors)
-- Update display order to group homeowner categories together
UPDATE public.project_categories SET display_order = 1 WHERE category_code = 'HOME_CLEANOUT';
UPDATE public.project_categories SET display_order = 2 WHERE category_code = 'REMODEL';
UPDATE public.project_categories SET display_order = 3 WHERE category_code = 'ROOFING';
UPDATE public.project_categories SET display_order = 4 WHERE category_code = 'LANDSCAPING';

-- 2) Add missing materials for homeowner use cases
INSERT INTO public.material_catalog (
  material_code, display_name, display_name_es, group_name, 
  default_pricing_model, green_halo_allowed, is_heavy_material, 
  allowed_sizes_json, description_short, description_short_es, 
  display_order, is_active
)
VALUES 
  ('LIGHT_CONSTRUCTION_DEBRIS', 'Light Construction Debris', 'Escombros de Construcción Ligeros', 
   'General Debris', 'DEBRIS', false, false, '[10,20,30,40]'::jsonb,
   'Drywall, lumber, light fixtures, cabinets', 'Yeso, madera, accesorios, gabinetes',
   2, true),
  ('SMALL_CONCRETE', 'Small Concrete/Pavers', 'Concreto Pequeño/Adoquines',
   'Heavy Clean', 'HEAVY_BASE', true, true, '[6,8,10]'::jsonb,
   'Patio, walkway, or driveway concrete pieces', 'Piezas de concreto de patio, camino o entrada',
   7, true)
ON CONFLICT (material_code) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  display_name_es = EXCLUDED.display_name_es,
  description_short = EXCLUDED.description_short,
  is_active = true;

-- 3) Clear existing homeowner offers and reseed with correct mappings
DELETE FROM public.customer_material_offers WHERE customer_type = 'homeowner';

-- HOMEOWNER + HOME_CLEANOUT
INSERT INTO public.customer_material_offers (customer_type, project_category_code, material_code, priority, is_recommended, is_hidden)
VALUES
  ('homeowner', 'HOME_CLEANOUT', 'MIXED_DEBRIS', 1, true, false),
  ('homeowner', 'HOME_CLEANOUT', 'HOUSEHOLD_JUNK', 2, false, false),
  ('homeowner', 'HOME_CLEANOUT', 'LIGHT_CONSTRUCTION_DEBRIS', 3, false, false);

-- HOMEOWNER + REMODEL (aka REMODEL_RENOVATION)
INSERT INTO public.customer_material_offers (customer_type, project_category_code, material_code, priority, is_recommended, is_hidden)
VALUES
  ('homeowner', 'REMODEL', 'CONSTRUCTION_DEBRIS', 1, true, false),
  ('homeowner', 'REMODEL', 'CLEAN_WOOD', 2, false, false),
  ('homeowner', 'REMODEL', 'SMALL_CONCRETE', 3, false, false),
  ('homeowner', 'REMODEL', 'MIXED_DEBRIS', 4, false, false);

-- HOMEOWNER + YARD_CLEANUP (force DEBRIS_HEAVY)
INSERT INTO public.customer_material_offers (customer_type, project_category_code, material_code, priority, is_recommended, is_hidden)
VALUES
  ('homeowner', 'YARD_CLEANUP', 'GRASS_YARD_WASTE', 1, true, false);

-- HOMEOWNER + LANDSCAPING (keep for compatibility)
INSERT INTO public.customer_material_offers (customer_type, project_category_code, material_code, priority, is_recommended, is_hidden)
VALUES
  ('homeowner', 'LANDSCAPING', 'GRASS_YARD_WASTE', 1, true, false),
  ('homeowner', 'LANDSCAPING', 'SOIL_CLEAN', 2, false, false),
  ('homeowner', 'LANDSCAPING', 'ROCK_GRAVEL_CLEAN', 3, false, false);

-- HOMEOWNER + SMALL_CONCRETE_PAVERS (heavy with fill-line)
INSERT INTO public.customer_material_offers (customer_type, project_category_code, material_code, priority, is_recommended, is_hidden)
VALUES
  ('homeowner', 'SMALL_CONCRETE_PAVERS', 'CONCRETE_CLEAN', 1, true, false),
  ('homeowner', 'SMALL_CONCRETE_PAVERS', 'SMALL_CONCRETE', 2, false, false),
  ('homeowner', 'SMALL_CONCRETE_PAVERS', 'BRICK_TILE_CLEAN', 3, false, false);

-- HOMEOWNER + GARAGE_PROPERTY_CLEANOUT
INSERT INTO public.customer_material_offers (customer_type, project_category_code, material_code, priority, is_recommended, is_hidden)
VALUES
  ('homeowner', 'GARAGE_PROPERTY_CLEANOUT', 'MIXED_DEBRIS', 1, true, false),
  ('homeowner', 'GARAGE_PROPERTY_CLEANOUT', 'HOUSEHOLD_JUNK', 2, false, false),
  ('homeowner', 'GARAGE_PROPERTY_CLEANOUT', 'CONSTRUCTION_DEBRIS', 3, false, false);

-- HOMEOWNER + ROOFING (keep existing)
INSERT INTO public.customer_material_offers (customer_type, project_category_code, material_code, priority, is_recommended, is_hidden)
VALUES
  ('homeowner', 'ROOFING', 'ROOFING_MIXED', 1, true, false),
  ('homeowner', 'ROOFING', 'CONSTRUCTION_DEBRIS', 2, false, false);

-- 4) Create customer_type visibility rules table for categories
CREATE TABLE IF NOT EXISTS public.customer_category_visibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_type TEXT NOT NULL,
  category_code TEXT NOT NULL REFERENCES public.project_categories(category_code) ON DELETE CASCADE,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(customer_type, category_code)
);

-- Enable RLS
ALTER TABLE public.customer_category_visibility ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can read category visibility"
  ON public.customer_category_visibility FOR SELECT
  USING (true);

-- Admin write
CREATE POLICY "Admins can manage category visibility"
  ON public.customer_category_visibility FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed homeowner category visibility (hide commercial categories)
INSERT INTO public.customer_category_visibility (customer_type, category_code, is_visible, display_order)
VALUES
  ('homeowner', 'HOME_CLEANOUT', true, 1),
  ('homeowner', 'REMODEL', true, 2),
  ('homeowner', 'ROOFING', true, 3),
  ('homeowner', 'YARD_CLEANUP', true, 4),
  ('homeowner', 'LANDSCAPING', true, 5),
  ('homeowner', 'SMALL_CONCRETE_PAVERS', true, 6),
  ('homeowner', 'GARAGE_PROPERTY_CLEANOUT', true, 7),
  ('homeowner', 'DEMOLITION', false, 99),
  ('homeowner', 'NEW_CONSTRUCTION', false, 99),
  ('homeowner', 'COMMERCIAL_TRASH', false, 99),
  ('homeowner', 'COMMERCIAL_RECYCLING', false, 99),
  ('homeowner', 'WAREHOUSE_CLEANOUT', false, 99),
  ('homeowner', 'PROPERTY_MANAGEMENT', false, 99)
ON CONFLICT (customer_type, category_code) DO UPDATE SET
  is_visible = EXCLUDED.is_visible,
  display_order = EXCLUDED.display_order;