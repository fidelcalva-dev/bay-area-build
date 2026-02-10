-- Add invite_token_hash column to staff_invites for one-time invite links
ALTER TABLE public.staff_invites ADD COLUMN IF NOT EXISTS invite_token_hash TEXT;

-- Add index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_staff_invites_token_hash 
ON public.staff_invites(invite_token_hash) 
WHERE invite_token_hash IS NOT NULL;

-- Make temp_password_hash nullable (no longer required for invite-link flow)
ALTER TABLE public.staff_invites ALTER COLUMN temp_password_hash DROP NOT NULL;