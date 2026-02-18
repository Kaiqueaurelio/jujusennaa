-- Fix ads SELECT policies: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view active ads" ON public.ads;
DROP POLICY IF EXISTS "Admins can view all ads" ON public.ads;

CREATE POLICY "Anyone can view active ads"
ON public.ads
FOR SELECT
TO public
USING (active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can view all ads"
ON public.ads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Fix user_roles SELECT policies: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));