-- CAL 010: remove two legacy dump-ticket rules that had no role check (anyone could delete
-- or replace dump tickets). The role-checked "Staff can update/delete dump tickets" rules remain.
DROP POLICY IF EXISTS "Admins can delete dump tickets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update dump tickets" ON storage.objects;