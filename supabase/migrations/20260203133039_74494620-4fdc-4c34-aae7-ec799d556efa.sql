-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can view active ads" ON public.ads;
DROP POLICY IF EXISTS "Admins can manage ads" ON public.ads;

-- Create permissive policies (OR logic)
-- Anyone can view active, non-expired ads
CREATE POLICY "Anyone can view active ads"
ON public.ads
FOR SELECT
USING (
  (active = true AND (expires_at IS NULL OR expires_at > now()))
);

-- Admins can view all ads (including inactive)
CREATE POLICY "Admins can view all ads"
ON public.ads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert ads
CREATE POLICY "Admins can insert ads"
ON public.ads
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update ads
CREATE POLICY "Admins can update ads"
ON public.ads
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete ads
CREATE POLICY "Admins can delete ads"
ON public.ads
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));