-- The current "Users can view their own roles" policy is fine (users can only see their own).
-- But "Admins can view all roles" could let an admin enumerate all admin accounts.
-- This is acceptable for admin functionality, but let's ensure non-authenticated users 
-- cannot query the table at all (which is already the case with current policies).
-- No changes needed to user_roles RLS - it's already properly secured.

-- Just a no-op migration to confirm the policies are correct
SELECT 1;