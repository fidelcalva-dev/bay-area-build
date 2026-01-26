-- ============================================================
-- SMART MATERIAL OPTIONS - Phase 1: Database Tables
-- ============================================================

-- 1. Project Categories Table
CREATE TABLE IF NOT EXISTS public.project_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_code TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  display_name_es TEXT,
  description TEXT,
  description_es TEXT,
  icon TEXT DEFAULT 'package',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;

-- Read access for all (public catalog)
CREATE POLICY "Anyone can read project categories"
ON public.project_categories
FOR SELECT
USING (true);

-- Admin write access
CREATE POLICY "Admins can manage project categories"
ON public.project_categories
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Material Catalog Table
CREATE TABLE IF NOT EXISTS public.material_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_code TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  display_name_es TEXT,
  group_name TEXT NOT NULL, -- e.g., 'Construction', 'Heavy Clean', 'Recycling', etc.
  description_short TEXT,
  description_short_es TEXT,
  default_pricing_model TEXT NOT NULL CHECK (default_pricing_model IN ('DEBRIS', 'DEBRIS_HEAVY', 'HEAVY_BASE', 'GREEN_HALO')),
  green_halo_allowed BOOLEAN DEFAULT false,
  allowed_sizes_json JSONB DEFAULT '[6,8,10,20,30,40,50]'::jsonb,
  icon TEXT DEFAULT 'package',
  density_hint TEXT DEFAULT 'Medium',
  requires_contamination_check BOOLEAN DEFAULT false,
  is_heavy_material BOOLEAN DEFAULT false,
  heavy_increment INTEGER DEFAULT 0, -- 0, 200, or 300
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.material_catalog ENABLE ROW LEVEL SECURITY;

-- Read access for all (public catalog)
CREATE POLICY "Anyone can read material catalog"
ON public.material_catalog
FOR SELECT
USING (true);

-- Admin write access
CREATE POLICY "Admins can manage material catalog"
ON public.material_catalog
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Customer Material Offers Table (controls what shows per segment)
CREATE TABLE IF NOT EXISTS public.customer_material_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_type TEXT NOT NULL, -- 'homeowner', 'contractor', 'business', 'preferred_contractor', 'wholesaler'
  project_category_code TEXT NOT NULL REFERENCES public.project_categories(category_code) ON DELETE CASCADE,
  material_code TEXT NOT NULL REFERENCES public.material_catalog(material_code) ON DELETE CASCADE,
  priority INTEGER DEFAULT 50 CHECK (priority >= 1 AND priority <= 100), -- 1 = highest
  is_recommended BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(customer_type, project_category_code, material_code)
);

-- Enable RLS
ALTER TABLE public.customer_material_offers ENABLE ROW LEVEL SECURITY;

-- Read access for all
CREATE POLICY "Anyone can read material offers"
ON public.customer_material_offers
FOR SELECT
USING (true);

-- Admin write access
CREATE POLICY "Admins can manage material offers"
ON public.customer_material_offers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_material_offers_lookup 
ON public.customer_material_offers(customer_type, project_category_code, is_hidden);

CREATE INDEX IF NOT EXISTS idx_material_catalog_active 
ON public.material_catalog(is_active, group_name);

-- ============================================================
-- SEED DATA: Project Categories
-- ============================================================

INSERT INTO public.project_categories (category_code, display_name, display_name_es, description, description_es, icon, display_order) VALUES
('HOME_CLEANOUT', 'Home Cleanout', 'Limpieza del Hogar', 'Garage, attic, basement, general decluttering', 'Garaje, ático, sótano, limpieza general', 'home', 10),
('REMODEL', 'Remodel/Renovation', 'Remodelación/Renovación', 'Kitchen, bathroom, room addition', 'Cocina, baño, ampliación', 'hammer', 20),
('ROOFING', 'Roofing Project', 'Proyecto de Techo', 'Roof tear-off and replacement', 'Retiro y reemplazo de techo', 'hard-hat', 30),
('DEMOLITION', 'Demolition', 'Demolición', 'Partial or full structure demo', 'Demolición parcial o total', 'wrench', 40),
('LANDSCAPING', 'Landscaping/Yard', 'Jardinería/Patio', 'Yard cleanup, tree removal, hardscape', 'Limpieza de jardín, remoción de árboles', 'tree-pine', 50),
('NEW_CONSTRUCTION', 'New Construction', 'Nueva Construcción', 'New build debris and materials', 'Escombros y materiales de nueva construcción', 'building-2', 60),
('COMMERCIAL_TRASH', 'Commercial Trash', 'Basura Comercial', 'Office, retail, warehouse general waste', 'Desechos generales de oficina, tienda, bodega', 'building', 70),
('COMMERCIAL_RECYCLING', 'Commercial Recycling', 'Reciclaje Comercial', 'Separated recyclables for businesses', 'Reciclables separados para negocios', 'recycle', 80),
('WAREHOUSE_CLEANOUT', 'Warehouse Cleanout', 'Limpieza de Bodega', 'Large-scale commercial cleanout', 'Limpieza comercial a gran escala', 'warehouse', 90),
('PROPERTY_MANAGEMENT', 'Property Management', 'Administración de Propiedades', 'Tenant turnover, maintenance', 'Cambio de inquilinos, mantenimiento', 'key', 100)
ON CONFLICT (category_code) DO NOTHING;

-- ============================================================
-- SEED DATA: Material Catalog
-- ============================================================

INSERT INTO public.material_catalog (material_code, display_name, display_name_es, group_name, description_short, description_short_es, default_pricing_model, green_halo_allowed, allowed_sizes_json, icon, density_hint, requires_contamination_check, is_heavy_material, heavy_increment, display_order) VALUES
-- Mixed/General Debris
('MIXED_DEBRIS', 'Mixed Debris', 'Escombros Mixtos', 'General Debris', 'Various mixed materials', 'Varios materiales mixtos', 'DEBRIS', true, '[6,8,10,20,30,40,50]', 'layers', 'Medium-Heavy', false, false, 0, 10),
('CONSTRUCTION_DEBRIS', 'Construction Debris', 'Escombros de Construcción', 'Construction', 'Drywall, lumber, fixtures', 'Paneles de yeso, madera, accesorios', 'DEBRIS', true, '[6,8,10,20,30,40,50]', 'hammer', 'Medium-Heavy', false, false, 0, 20),
('DEMOLITION_DEBRIS', 'Demolition Debris', 'Escombros de Demolición', 'Construction', 'Demo waste, mixed materials', 'Residuos de demolición, materiales mixtos', 'DEBRIS', true, '[6,8,10,20,30,40,50]', 'wrench', 'Heavy', false, false, 0, 30),
('HOUSEHOLD_JUNK', 'Household/Junk', 'Hogar/Basura', 'General Debris', 'Furniture, boxes, clutter', 'Muebles, cajas, desorden', 'DEBRIS', false, '[6,8,10,20,30,40,50]', 'home', 'Light-Medium', false, false, 0, 40),
('ROOFING_MIXED', 'Roofing (Mixed)', 'Techo (Mixto)', 'Construction', 'Shingles with some debris', 'Tejas con algo de escombros', 'DEBRIS', false, '[10,20,30,40]', 'hard-hat', 'Heavy', false, false, 0, 50),

-- Heavy Clean Materials
('CONCRETE_CLEAN', 'Concrete Only (Clean)', 'Solo Concreto (Limpio)', 'Heavy Clean', '100% clean broken concrete', 'Concreto roto 100% limpio', 'HEAVY_BASE', true, '[6,8,10]', 'cuboid', 'Heavy', true, true, 0, 100),
('ASPHALT_CLEAN', 'Asphalt Only (Clean)', 'Solo Asfalto (Limpio)', 'Heavy Clean', '100% clean broken asphalt', 'Asfalto roto 100% limpio', 'HEAVY_BASE', true, '[6,8,10]', 'circle-dot', 'Heavy', true, true, 200, 110),
('SOIL_CLEAN', 'Dirt/Soil Only (Clean)', 'Solo Tierra (Limpia)', 'Heavy Clean', 'Clean dirt, topsoil, sand', 'Tierra limpia, arena', 'HEAVY_BASE', false, '[6,8,10]', 'mountain', 'Heavy', true, true, 0, 120),
('ROCK_GRAVEL_CLEAN', 'Rock/Gravel Only (Clean)', 'Solo Roca/Grava (Limpia)', 'Heavy Clean', 'Rock, gravel, landscape stone', 'Roca, grava, piedra de paisaje', 'HEAVY_BASE', false, '[6,8,10]', 'mountain', 'Heavy', true, true, 200, 130),
('BRICK_TILE_CLEAN', 'Brick/Tile Only (Clean)', 'Solo Ladrillo/Azulejo (Limpio)', 'Heavy Clean', 'Brick, cinder block, tile', 'Ladrillo, bloque, azulejo', 'HEAVY_BASE', true, '[6,8,10]', 'boxes', 'Heavy', true, true, 200, 140),

-- Yard Waste (routes to DEBRIS_HEAVY)
('GRASS_YARD_WASTE', 'Grass/Yard Waste', 'Residuos de Jardín', 'Landscaping', 'Grass, shrubs, leaves (heavy)', 'Césped, arbustos, hojas (pesado)', 'DEBRIS_HEAVY', false, '[6,8,10]', 'leaf', 'Heavy', false, true, 0, 200),

-- Clean Recyclables
('CLEAN_WOOD', 'Clean Wood Only', 'Solo Madera Limpia', 'Recycling Streams', 'Untreated lumber, pallets', 'Madera sin tratar, paletas', 'DEBRIS', true, '[6,8,10,20,30,40,50]', 'tree-pine', 'Light-Medium', false, false, 0, 300),
('CLEAN_WOOD_CHIPS', 'Clean Wood Chips', 'Astillas de Madera Limpia', 'Recycling Streams', 'Mulch, wood chips only', 'Mantillo, solo astillas de madera', 'DEBRIS', true, '[6,8,10,20,30,40,50]', 'tree-pine', 'Light', false, false, 0, 310),
('METAL_RECYCLING', 'Metal Recycling', 'Reciclaje de Metal', 'Recycling Streams', 'Scrap metal, steel, iron', 'Chatarra, acero, hierro', 'GREEN_HALO', true, '[6,8,10,20,30,40]', 'wrench', 'Heavy', false, false, 0, 320),
('CARDBOARD_RECYCLING', 'Cardboard Recycling', 'Reciclaje de Cartón', 'Recycling Streams', 'Clean cardboard only', 'Solo cartón limpio', 'GREEN_HALO', true, '[20,30,40,50]', 'package', 'Light', false, false, 0, 330),
('PLASTIC_RECYCLING', 'Plastic Recycling', 'Reciclaje de Plástico', 'Recycling Streams', 'Clean plastic materials', 'Materiales plásticos limpios', 'GREEN_HALO', true, '[20,30,40,50]', 'package', 'Light', false, false, 0, 340),

-- Commercial Waste
('TRASH_COMMERCIAL', 'Commercial Trash', 'Basura Comercial', 'Commercial Waste', 'General business waste', 'Residuos generales de negocio', 'DEBRIS', false, '[10,20,30,40,50]', 'building', 'Medium', false, false, 0, 400)
ON CONFLICT (material_code) DO NOTHING;

-- ============================================================
-- SEED DATA: Customer Material Offers (Smart Filtering Rules)
-- ============================================================

-- HOMEOWNER offers
INSERT INTO public.customer_material_offers (customer_type, project_category_code, material_code, priority, is_recommended, is_hidden) VALUES
-- Homeowner + Home Cleanout
('homeowner', 'HOME_CLEANOUT', 'HOUSEHOLD_JUNK', 1, true, false),
('homeowner', 'HOME_CLEANOUT', 'MIXED_DEBRIS', 2, false, false),
('homeowner', 'HOME_CLEANOUT', 'CLEAN_WOOD', 3, false, false),
-- Homeowner + Remodel
('homeowner', 'REMODEL', 'CONSTRUCTION_DEBRIS', 1, true, false),
('homeowner', 'REMODEL', 'MIXED_DEBRIS', 2, false, false),
('homeowner', 'REMODEL', 'HOUSEHOLD_JUNK', 3, false, false),
-- Homeowner + Roofing
('homeowner', 'ROOFING', 'ROOFING_MIXED', 1, true, false),
('homeowner', 'ROOFING', 'CONSTRUCTION_DEBRIS', 2, false, false),
-- Homeowner + Landscaping
('homeowner', 'LANDSCAPING', 'GRASS_YARD_WASTE', 1, true, false),
('homeowner', 'LANDSCAPING', 'SOIL_CLEAN', 2, false, false),
('homeowner', 'LANDSCAPING', 'ROCK_GRAVEL_CLEAN', 3, false, false),
('homeowner', 'LANDSCAPING', 'CLEAN_WOOD_CHIPS', 4, false, false)
ON CONFLICT (customer_type, project_category_code, material_code) DO NOTHING;

-- CONTRACTOR offers
INSERT INTO public.customer_material_offers (customer_type, project_category_code, material_code, priority, is_recommended, is_hidden) VALUES
-- Contractor + Remodel
('contractor', 'REMODEL', 'CONSTRUCTION_DEBRIS', 1, true, false),
('contractor', 'REMODEL', 'DEMOLITION_DEBRIS', 2, false, false),
('contractor', 'REMODEL', 'CLEAN_WOOD', 3, false, false),
('contractor', 'REMODEL', 'MIXED_DEBRIS', 4, false, false),
-- Contractor + Demolition
('contractor', 'DEMOLITION', 'DEMOLITION_DEBRIS', 1, true, false),
('contractor', 'DEMOLITION', 'CONCRETE_CLEAN', 2, true, false),
('contractor', 'DEMOLITION', 'BRICK_TILE_CLEAN', 3, false, false),
('contractor', 'DEMOLITION', 'MIXED_DEBRIS', 4, false, false),
-- Contractor + Roofing
('contractor', 'ROOFING', 'ROOFING_MIXED', 1, true, false),
('contractor', 'ROOFING', 'CONSTRUCTION_DEBRIS', 2, false, false),
-- Contractor + Landscaping
('contractor', 'LANDSCAPING', 'SOIL_CLEAN', 1, true, false),
('contractor', 'LANDSCAPING', 'ROCK_GRAVEL_CLEAN', 2, true, false),
('contractor', 'LANDSCAPING', 'GRASS_YARD_WASTE', 3, false, false),
('contractor', 'LANDSCAPING', 'CLEAN_WOOD_CHIPS', 4, false, false),
-- Contractor + New Construction
('contractor', 'NEW_CONSTRUCTION', 'CONSTRUCTION_DEBRIS', 1, true, false),
('contractor', 'NEW_CONSTRUCTION', 'CLEAN_WOOD', 2, false, false),
('contractor', 'NEW_CONSTRUCTION', 'MIXED_DEBRIS', 3, false, false)
ON CONFLICT (customer_type, project_category_code, material_code) DO NOTHING;

-- BUSINESS offers
INSERT INTO public.customer_material_offers (customer_type, project_category_code, material_code, priority, is_recommended, is_hidden) VALUES
-- Business + Commercial Trash
('business', 'COMMERCIAL_TRASH', 'TRASH_COMMERCIAL', 1, true, false),
('business', 'COMMERCIAL_TRASH', 'MIXED_DEBRIS', 2, false, false),
-- Business + Commercial Recycling
('business', 'COMMERCIAL_RECYCLING', 'CARDBOARD_RECYCLING', 1, true, false),
('business', 'COMMERCIAL_RECYCLING', 'METAL_RECYCLING', 2, true, false),
('business', 'COMMERCIAL_RECYCLING', 'PLASTIC_RECYCLING', 3, true, false),
('business', 'COMMERCIAL_RECYCLING', 'CLEAN_WOOD', 4, false, false),
('business', 'COMMERCIAL_RECYCLING', 'CLEAN_WOOD_CHIPS', 5, false, false),
-- Business + Warehouse Cleanout
('business', 'WAREHOUSE_CLEANOUT', 'MIXED_DEBRIS', 1, true, false),
('business', 'WAREHOUSE_CLEANOUT', 'CARDBOARD_RECYCLING', 2, false, false),
('business', 'WAREHOUSE_CLEANOUT', 'METAL_RECYCLING', 3, false, false),
('business', 'WAREHOUSE_CLEANOUT', 'TRASH_COMMERCIAL', 4, false, false),
-- Business + Property Management
('business', 'PROPERTY_MANAGEMENT', 'HOUSEHOLD_JUNK', 1, true, false),
('business', 'PROPERTY_MANAGEMENT', 'MIXED_DEBRIS', 2, false, false),
('business', 'PROPERTY_MANAGEMENT', 'CONSTRUCTION_DEBRIS', 3, false, false)
ON CONFLICT (customer_type, project_category_code, material_code) DO NOTHING;

-- PREFERRED_CONTRACTOR offers (same as contractor but with all options)
INSERT INTO public.customer_material_offers (customer_type, project_category_code, material_code, priority, is_recommended, is_hidden)
SELECT 'preferred_contractor', project_category_code, material_code, priority, is_recommended, is_hidden
FROM public.customer_material_offers
WHERE customer_type = 'contractor'
ON CONFLICT (customer_type, project_category_code, material_code) DO NOTHING;

-- WHOLESALER offers (show all with manual approval note)
INSERT INTO public.customer_material_offers (customer_type, project_category_code, material_code, priority, is_recommended, is_hidden)
SELECT DISTINCT 'wholesaler', pc.category_code, mc.material_code, 50, false, false
FROM public.project_categories pc
CROSS JOIN public.material_catalog mc
WHERE mc.is_active = true
ON CONFLICT (customer_type, project_category_code, material_code) DO NOTHING;

-- Add update trigger for updated_at
CREATE TRIGGER update_project_categories_updated_at
  BEFORE UPDATE ON public.project_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_material_catalog_updated_at
  BEFORE UPDATE ON public.material_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_material_offers_updated_at
  BEFORE UPDATE ON public.customer_material_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();