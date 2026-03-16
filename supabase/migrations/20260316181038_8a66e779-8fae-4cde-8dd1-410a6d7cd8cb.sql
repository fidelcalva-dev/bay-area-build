
-- Estimation templates table for AI project estimator
CREATE TABLE public.estimation_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_type TEXT NOT NULL UNIQUE,
  display_label TEXT NOT NULL,
  display_label_es TEXT NOT NULL,
  estimation_unit TEXT NOT NULL DEFAULT 'fixed' CHECK (estimation_unit IN ('sqft', 'linear_ft', 'room', 'fixed')),
  yd3_per_unit_min NUMERIC(6,4) NOT NULL DEFAULT 0,
  yd3_per_unit_max NUMERIC(6,4) NOT NULL DEFAULT 0,
  typical_range_min INTEGER NOT NULL DEFAULT 10,
  typical_range_max INTEGER NOT NULL DEFAULT 20,
  heavy_material_flag BOOLEAN NOT NULL DEFAULT false,
  default_size_recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  likely_materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  recyclable_materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  savings_tips JSONB NOT NULL DEFAULT '[]'::jsonb,
  savings_tips_es JSONB NOT NULL DEFAULT '[]'::jsonb,
  needs_photo_recommendation BOOLEAN NOT NULL DEFAULT false,
  confidence_behavior TEXT NOT NULL DEFAULT 'range',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.estimation_templates ENABLE ROW LEVEL SECURITY;

-- Public read for edge function
CREATE POLICY "Anyone can read active templates"
  ON public.estimation_templates FOR SELECT
  USING (is_active = true);

-- Admin write via has_role
CREATE POLICY "Admins can manage templates"
  ON public.estimation_templates FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed starter data
INSERT INTO public.estimation_templates (project_type, display_label, display_label_es, estimation_unit, yd3_per_unit_min, yd3_per_unit_max, typical_range_min, typical_range_max, heavy_material_flag, default_size_recommendations, recyclable_materials, savings_tips, savings_tips_es, needs_photo_recommendation, sort_order) VALUES
('full_house_demo', 'Full House Demolition', 'Demolición de Casa Completa', 'sqft', 0.05, 0.08, 60, 160, false, '["30","40","50"]', '["wood","metal","concrete","drywall","roofing"]', '["Separate concrete and metal for flat-rate pricing","Stage demo in phases to keep clean loads clean","Upload photos or plans for a more accurate estimate"]', '["Separe concreto y metal para tarifa fija","Organice la demolición en fases para mantener cargas limpias","Suba fotos o planos para un estimado más preciso"]', true, 1),
('interior_demo', 'Interior Demolition', 'Demolición Interior', 'sqft', 0.02, 0.04, 20, 60, false, '["20","30"]', '["drywall","wood","metal","carpet"]', '["If removing tile over concrete, the concrete may qualify for flat-rate heavy pricing","Keep drywall separate from heavy materials"]', '["Si remueve azulejo sobre concreto, puede calificar para tarifa fija","Mantenga drywall separado de materiales pesados"]', false, 2),
('kitchen_remodel', 'Kitchen Remodel', 'Remodelación de Cocina', 'fixed', 0, 0, 10, 20, false, '["10","20"]', '["wood","metal","appliances","drywall"]', '["A 20-yard usually covers a full kitchen demo and rebuild","Appliances without Freon can go in at no extra charge"]', '["Un contenedor de 20 yardas normalmente cubre una cocina completa","Electrodomésticos sin Freón pueden ir sin cargo extra"]', false, 3),
('bathroom_remodel', 'Bathroom Remodel', 'Remodelación de Baño', 'fixed', 0, 0, 5, 10, false, '["5","10"]', '["tile","drywall","fixtures"]', '["A 10-yard is usually sufficient for a single bathroom","If removing a cast-iron tub, it counts toward weight"]', '["Un contenedor de 10 yardas normalmente es suficiente para un baño","Si remueve una tina de hierro fundido, cuenta hacia el peso"]', false, 4),
('garage_cleanout', 'Garage Cleanout', 'Limpieza de Garaje', 'fixed', 0, 0, 10, 20, false, '["10","20"]', '["metal","cardboard","wood"]', '["Single-car garage: 10yd. Double garage: 20yd","Separate recyclable metal to reduce load weight"]', '["Garaje sencillo: 10yd. Garaje doble: 20yd","Separe metal reciclable para reducir peso"]', false, 5),
('roofing', 'Roofing Tear-Off', 'Retiro de Techo', 'sqft', 0.008, 0.015, 10, 30, false, '["10","20","30"]', '["shingles"]', '["Single-layer produces less debris; multi-layer can double volume","Roofing shingles are heavy — stay within included tonnage"]', '["Una capa produce menos escombro; multicapa puede duplicar volumen","Las tejas son pesadas — manténgase dentro del tonelaje incluido"]', true, 6),
('construction_debris', 'Construction Debris', 'Escombro de Construcción', 'fixed', 0, 0, 20, 40, false, '["20","30","40"]', '["wood","metal","cardboard","drywall"]', '["Ask about swap service for continuous debris","Contractors should apply for volume pricing"]', '["Pregunte por servicio de intercambio para escombro continuo","Los contratistas deben solicitar precios por volumen"]', false, 7),
('office_cleanout', 'Office Cleanout', 'Limpieza de Oficina', 'fixed', 0, 0, 10, 30, false, '["10","20","30"]', '["cardboard","metal"]', '["Electronics cannot go in dumpsters — arrange e-waste pickup","Flatten cardboard to maximize space"]', '["Electrónicos no pueden ir en contenedores — coordine recolección de e-waste","Aplane cartón para maximizar espacio"]', false, 8),
('yard_cleanup', 'Yard Cleanup', 'Limpieza de Jardín', 'fixed', 0, 0, 5, 20, false, '["5","10","20"]', '["green_waste","wood"]', '["Green waste is lighter — you can fit more volume","Keep soil separate if present — requires heavy-material containers"]', '["Los desechos verdes son más livianos — cabe más volumen","Mantenga tierra separada — requiere contenedores de material pesado"]', false, 9),
('concrete_removal', 'Concrete Removal', 'Retiro de Concreto', 'fixed', 0, 0, 5, 10, true, '["5","8","10"]', '["concrete"]', '["Clean concrete gets flat-rate pricing — no weight overage","Keep the load clean — mixing trash triggers reclassification","Concrete with rebar is accepted but may have different pricing"]', '["Concreto limpio: tarifa fija sin excedentes de peso","Mantenga la carga limpia — mezclar basura activa reclasificación","Concreto con varilla se acepta pero puede tener precios diferentes"]', false, 10),
('soil_excavation', 'Soil / Dirt Excavation', 'Excavación de Tierra', 'fixed', 0, 0, 5, 10, true, '["5","8","10"]', '["soil"]', '["Clean soil gets flat-rate pricing with no weight surprises","Do not mix trash, roots, or debris into a clean soil container"]', '["Tierra limpia: tarifa fija sin sorpresas de peso","No mezcle basura, raíces o escombro en un contenedor de tierra limpia"]', false, 11),
('deck_fence_demo', 'Deck / Fence Demolition', 'Demolición de Deck / Cerca', 'linear_ft', 0.05, 0.10, 10, 20, false, '["10","20"]', '["wood","metal"]', '["Break down lumber to maximize container space","Metal hardware and fencing can often be recycled separately"]', '["Corte la madera para maximizar espacio","La ferretería metálica se puede reciclar por separado"]', false, 12),
('estate_cleanout', 'Estate / Eviction Cleanout', 'Limpieza de Propiedad / Desalojo', 'fixed', 0, 0, 20, 40, false, '["20","30","40"]', '["metal","cardboard","furniture"]', '["Consider multiple containers or swap service for large estates","Mattresses carry a $50 recycling fee each"]', '["Considere múltiples contenedores o servicio de intercambio","Los colchones tienen cargo de reciclaje de $50 cada uno"]', false, 13),
('tenant_improvement', 'Tenant Improvement', 'Mejora de Local Comercial', 'sqft', 0.02, 0.05, 10, 30, false, '["10","20","30"]', '["drywall","metal","cardboard","carpet"]', '["Phase your build-out — swap service keeps a fresh container on site","Flatten cardboard packaging to maximize space"]', '["Organice la remodelación en fases — intercambio mantiene contenedor limpio","Aplane cartón de embalaje para maximizar espacio"]', false, 14),
('contractor_recurring', 'Contractor Recurring Job', 'Trabajo Recurrente de Contratista', 'fixed', 0, 0, 20, 40, false, '["20","30","40"]', '["wood","metal","cardboard","drywall"]', '["Apply for a contractor account for volume pricing","Swap service works well for continuous debris generation"]', '["Solicite cuenta de contratista para precios por volumen","El servicio de intercambio funciona bien para escombro continuo"]', false, 15),
('mixed_unknown', 'Mixed / Not Sure', 'Mixto / No Estoy Seguro', 'fixed', 0, 0, 10, 20, false, '["10","20"]', '["metal","cardboard"]', '["Upload a photo for a more accurate recommendation","A 20-yard is the most popular all-purpose size"]', '["Suba una foto para una recomendación más precisa","El contenedor de 20 yardas es el más popular para uso general"]', true, 16);
