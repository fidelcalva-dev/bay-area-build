-- ============================================================
-- DISPOSAL ITEM CATALOG - Common Materials for Quick Selection
-- ============================================================

-- Main catalog table
CREATE TABLE public.disposal_item_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  item_group TEXT NOT NULL, -- HOUSEHOLD, CONSTRUCTION, HEAVY, RECYCLING, YARD
  volume_points INTEGER NOT NULL DEFAULT 5, -- relative volume per unit
  weight_class TEXT NOT NULL DEFAULT 'MED', -- LIGHT, MED, HEAVY
  forces_category TEXT, -- YARD_WASTE, HEAVY, RECYCLING (if selected, forces this category)
  default_material_code TEXT, -- optional mapping to existing material code
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 100,
  icon_name TEXT, -- Lucide icon name
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.disposal_item_catalog ENABLE ROW LEVEL SECURITY;

-- Public read access for catalog (no auth required)
CREATE POLICY "Anyone can read catalog items"
ON public.disposal_item_catalog FOR SELECT
USING (is_active = true);

-- Staff can manage catalog
CREATE POLICY "Staff can manage catalog"
ON public.disposal_item_catalog FOR ALL
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'ops_admin', 'sales', 'cs']::app_role[]));

-- Quote item selections table (for analytics and recommendation engine)
CREATE TABLE public.quote_item_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  quote_id UUID,
  item_code TEXT NOT NULL,
  quantity_level TEXT NOT NULL DEFAULT 'MED', -- SMALL, MED, LARGE
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quote_item_selections ENABLE ROW LEVEL SECURITY;

-- Public insert (anyone can create during quote flow)
CREATE POLICY "Anyone can insert selections"
ON public.quote_item_selections FOR INSERT
WITH CHECK (true);

-- Public read for session owner
CREATE POLICY "Anyone can read selections"
ON public.quote_item_selections FOR SELECT
USING (true);

-- Indexes
CREATE INDEX idx_disposal_item_catalog_group ON public.disposal_item_catalog(item_group);
CREATE INDEX idx_disposal_item_catalog_order ON public.disposal_item_catalog(display_order);
CREATE INDEX idx_quote_item_selections_session ON public.quote_item_selections(session_id);
CREATE INDEX idx_quote_item_selections_quote ON public.quote_item_selections(quote_id);

-- ============================================================
-- SEED CATALOG DATA
-- ============================================================

-- HOUSEHOLD GROUP (volume_points optimized for typical pickup volume)
INSERT INTO public.disposal_item_catalog (item_code, display_name, item_group, volume_points, weight_class, icon_name, display_order) VALUES
('BOXES', 'Cardboard Boxes', 'HOUSEHOLD', 2, 'LIGHT', 'Package', 10),
('FURNITURE', 'Furniture', 'HOUSEHOLD', 8, 'MED', 'Armchair', 20),
('MATTRESS', 'Mattress', 'HOUSEHOLD', 6, 'MED', 'Bed', 30),
('APPLIANCES', 'Appliances', 'HOUSEHOLD', 7, 'HEAVY', 'Refrigerator', 40),
('GENERAL_JUNK', 'General Junk', 'HOUSEHOLD', 5, 'MED', 'Trash2', 50);

-- CONSTRUCTION GROUP
INSERT INTO public.disposal_item_catalog (item_code, display_name, item_group, volume_points, weight_class, icon_name, display_order) VALUES
('DRYWALL', 'Drywall', 'CONSTRUCTION', 6, 'MED', 'Square', 60),
('WOOD_FRAMING', 'Wood Framing', 'CONSTRUCTION', 7, 'MED', 'Logs', 70),
('CABINETS', 'Cabinets', 'CONSTRUCTION', 8, 'MED', 'Grid2x2', 80),
('FLOORING', 'Flooring', 'CONSTRUCTION', 5, 'MED', 'LayoutGrid', 90),
('ROOFING_SHINGLES', 'Roofing Shingles', 'CONSTRUCTION', 6, 'HEAVY', 'Home', 100);

-- HEAVY GROUP (forces heavy material handling)
INSERT INTO public.disposal_item_catalog (item_code, display_name, item_group, volume_points, weight_class, forces_category, default_material_code, icon_name, display_order) VALUES
('CONCRETE', 'Concrete', 'HEAVY', 5, 'HEAVY', 'HEAVY_MATERIALS', 'CONCRETE_CLEAN', 'Layers', 110),
('BRICK_TILE', 'Brick & Tile', 'HEAVY', 5, 'HEAVY', 'HEAVY_MATERIALS', 'BRICK_TILE', 'Grid3x3', 120),
('ASPHALT', 'Asphalt', 'HEAVY', 5, 'HEAVY', 'HEAVY_MATERIALS', 'ASPHALT', 'CircleDashed', 130),
('DIRT', 'Dirt & Soil', 'HEAVY', 6, 'HEAVY', 'HEAVY_MATERIALS', 'DIRT_SOIL', 'Mountain', 140),
('ROCK_GRAVEL', 'Rock & Gravel', 'HEAVY', 5, 'HEAVY', 'HEAVY_MATERIALS', 'ROCK_GRAVEL', 'Gem', 150),
('GRANITE', 'Granite/Stone', 'HEAVY', 4, 'HEAVY', 'HEAVY_MATERIALS', 'GRANITE', 'Diamond', 160);

-- RECYCLING GROUP
INSERT INTO public.disposal_item_catalog (item_code, display_name, item_group, volume_points, weight_class, forces_category, default_material_code, icon_name, display_order) VALUES
('CLEAN_WOOD', 'Clean Wood', 'RECYCLING', 7, 'MED', 'CLEAN_RECYCLING', 'WOOD_CLEAN', 'Trees', 170),
('WOOD_CHIPS', 'Wood Chips', 'RECYCLING', 4, 'LIGHT', 'CLEAN_RECYCLING', 'WOOD_CHIPS_CLEAN', 'Sparkles', 180),
('METAL', 'Metal/Scrap', 'RECYCLING', 4, 'HEAVY', 'CLEAN_RECYCLING', 'METAL', 'Factory', 190),
('CARDBOARD', 'Cardboard (bulk)', 'RECYCLING', 3, 'LIGHT', 'CLEAN_RECYCLING', 'CARDBOARD', 'Boxes', 200),
('PLASTIC', 'Plastic (commercial)', 'RECYCLING', 3, 'LIGHT', 'CLEAN_RECYCLING', 'PLASTIC', 'Container', 210);

-- YARD GROUP (routes to DEBRIS_HEAVY)
INSERT INTO public.disposal_item_catalog (item_code, display_name, item_group, volume_points, weight_class, forces_category, default_material_code, icon_name, display_order) VALUES
('GRASS_YARD_WASTE', 'Grass & Leaves', 'YARD', 5, 'MED', 'YARD_WASTE', 'GRASS_YARD_WASTE', 'Leaf', 220),
('BRANCHES', 'Branches & Brush', 'YARD', 6, 'MED', 'YARD_WASTE', 'BRANCHES', 'TreePine', 230),
('LANDSCAPING', 'Landscaping Debris', 'YARD', 5, 'MED', 'YARD_WASTE', 'LANDSCAPING', 'Flower2', 240);

-- Trigger for updated_at
CREATE TRIGGER update_disposal_item_catalog_updated_at
BEFORE UPDATE ON public.disposal_item_catalog
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();