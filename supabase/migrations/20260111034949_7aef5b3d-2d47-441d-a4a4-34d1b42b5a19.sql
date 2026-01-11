-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for admin protection
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles (admins only)
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create pricing_zones table
CREATE TABLE public.pricing_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    base_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create zone_zip_codes table for ZIP-to-Zone mapping
CREATE TABLE public.zone_zip_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES public.pricing_zones(id) ON DELETE CASCADE NOT NULL,
    zip_code TEXT NOT NULL,
    city_name TEXT,
    county TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (zip_code)
);

-- Create dumpster_sizes table
CREATE TABLE public.dumpster_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    size_value INTEGER NOT NULL UNIQUE,
    label TEXT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    included_tons DECIMAL(4,2) NOT NULL,
    description TEXT,
    dimensions TEXT,
    is_heavy_only BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create zone_pricing table for zone-specific price overrides
CREATE TABLE public.zone_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES public.pricing_zones(id) ON DELETE CASCADE NOT NULL,
    size_id UUID REFERENCES public.dumpster_sizes(id) ON DELETE CASCADE NOT NULL,
    price_override DECIMAL(10,2),
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (zone_id, size_id)
);

-- Create material_types table
CREATE TABLE public.material_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    price_adjustment DECIMAL(10,2) NOT NULL DEFAULT 0,
    allowed_sizes INTEGER[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create extras table
CREATE TABLE public.pricing_extras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    icon TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rental_periods table
CREATE TABLE public.rental_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    days INTEGER NOT NULL UNIQUE,
    label TEXT NOT NULL,
    extra_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendors/partners table
CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendor_zones table for vendor service coverage
CREATE TABLE public.vendor_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
    zone_id UUID REFERENCES public.pricing_zones(id) ON DELETE CASCADE NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (vendor_id, zone_id)
);

-- Create vendor_pricing table
CREATE TABLE public.vendor_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
    size_id UUID REFERENCES public.dumpster_sizes(id) ON DELETE CASCADE NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (vendor_id, size_id)
);

-- Enable RLS on all tables
ALTER TABLE public.pricing_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_zip_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dumpster_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_pricing ENABLE ROW LEVEL SECURITY;

-- Public read access for pricing data (for quote calculator)
CREATE POLICY "Anyone can view active zones"
ON public.pricing_zones FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view zone zip codes"
ON public.zone_zip_codes FOR SELECT USING (true);

CREATE POLICY "Anyone can view active sizes"
ON public.dumpster_sizes FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view zone pricing"
ON public.zone_pricing FOR SELECT USING (is_available = true);

CREATE POLICY "Anyone can view active materials"
ON public.material_types FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active extras"
ON public.pricing_extras FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active rental periods"
ON public.rental_periods FOR SELECT USING (is_active = true);

-- Admin-only write access for all pricing tables
CREATE POLICY "Admins can manage zones"
ON public.pricing_zones FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage zone zip codes"
ON public.zone_zip_codes FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage sizes"
ON public.dumpster_sizes FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage zone pricing"
ON public.zone_pricing FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage materials"
ON public.material_types FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage extras"
ON public.pricing_extras FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage rental periods"
ON public.rental_periods FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Vendor tables are admin-only
CREATE POLICY "Admins can view vendors"
ON public.vendors FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage vendors"
ON public.vendors FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view vendor zones"
ON public.vendor_zones FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage vendor zones"
ON public.vendor_zones FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view vendor pricing"
ON public.vendor_pricing FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage vendor pricing"
ON public.vendor_pricing FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add update triggers
CREATE TRIGGER update_pricing_zones_updated_at
BEFORE UPDATE ON public.pricing_zones
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dumpster_sizes_updated_at
BEFORE UPDATE ON public.dumpster_sizes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_zone_pricing_updated_at
BEFORE UPDATE ON public.zone_pricing
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_material_types_updated_at
BEFORE UPDATE ON public.material_types
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_extras_updated_at
BEFORE UPDATE ON public.pricing_extras
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rental_periods_updated_at
BEFORE UPDATE ON public.rental_periods
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_pricing_updated_at
BEFORE UPDATE ON public.vendor_pricing
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();