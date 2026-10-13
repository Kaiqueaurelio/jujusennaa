-- Intentionally does not grant administrator permissions based on an email address.
-- Provision the first administrator explicitly through a trusted Supabase SQL session
-- after verifying the user ID. Never hard-code admin identity in a signup trigger.
DROP TRIGGER IF EXISTS on_auth_user_created_grant_admin ON auth.users;
DROP FUNCTION IF EXISTS public.grant_admin_to_owner();
