-- Add 'reclassification' to the allowed line_type values
ALTER TABLE public.invoice_line_items 
DROP CONSTRAINT invoice_line_items_line_type_check;

ALTER TABLE public.invoice_line_items 
ADD CONSTRAINT invoice_line_items_line_type_check 
CHECK (line_type = ANY (ARRAY['base'::text, 'overage'::text, 'extra'::text, 'discount'::text, 'adjustment'::text, 'prepurchase'::text, 'reclassification'::text]));