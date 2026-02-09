
-- Drop restrictive SELECT policies on ads
DROP POLICY IF EXISTS "Anyone can view active ads" ON public.ads;
DROP POLICY IF EXISTS "Admins can view all ads" ON public.ads;

-- Recreate as PERMISSIVE
CREATE POLICY "Anyone can view active ads"
ON public.ads
FOR SELECT
TO public
USING ((active = true) AND ((expires_at IS NULL) OR (expires_at > now())));

CREATE POLICY "Admins can view all ads"
ON public.ads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
