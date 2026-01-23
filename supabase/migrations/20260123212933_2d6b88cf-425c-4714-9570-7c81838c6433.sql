-- Insert Calsan team staff users with correct department values
INSERT INTO public.staff_users (email, full_name, phone, department, status, created_by)
VALUES
  -- Billing (finance_billing)
  ('sergio.gomez@calsandumpsters.com', 'Sergio Gomez', NULL, 'finance_billing', 'active', NULL),
  ('veronica.velez@calsandumpsters.com', 'Veronica Velez', NULL, 'finance_billing', 'active', NULL),
  
  -- Executive (read-only)
  ('michelle.ochoa@calsandumpsters.com', 'Michelle Ochoa', NULL, 'executive', 'active', NULL),
  ('ximena.guevara@calsandumpsters.com', 'Ximena Guevara', NULL, 'executive', 'active', NULL),
  
  -- Sales
  ('jose.cabrera@calsandumpsters.com', 'Jose Cabrera', NULL, 'sales', 'active', NULL),
  
  -- Customer Service
  ('max.lara@calsandumpsters.com', 'Max Lara', NULL, 'customer_service', 'active', NULL),
  ('mariana.cardoza@calsandumpsters.com', 'Mariana Cardoza', NULL, 'customer_service', 'active', NULL),
  ('monse.cardoza@calsandumpsters.com', 'Monse Cardoza', NULL, 'customer_service', 'active', NULL),
  ('julieta.gerlero@calsandumpsters.com', 'Julieta Gerlero', NULL, 'customer_service', 'active', NULL),
  ('paty.contreras@calsandumpsters.com', 'Paty Contreras', NULL, 'customer_service', 'active', NULL),
  
  -- Operations Admin
  ('arturo.barcenas@calsandumpsters.com', 'Arturo Barcenas', NULL, 'operations_admin', 'active', NULL),
  
  -- Dispatch/Logistics
  ('citlali.delgado@calsandumpsters.com', 'Citlali Delgado', NULL, 'dispatch_logistics', 'active', NULL)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  department = EXCLUDED.department,
  status = EXCLUDED.status;

-- Create audit logs for each user creation using correct column names
INSERT INTO public.user_audit_logs (target_email, action, after_data, admin_id)
SELECT 
  email,
  'USER_CREATED',
  jsonb_build_object(
    'email', email,
    'full_name', full_name,
    'department', department,
    'status', status,
    'created_at', created_at
  ),
  NULL
FROM public.staff_users
WHERE email LIKE '%@calsandumpsters.com';