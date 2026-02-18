
-- 1. Restrict storage policies to admin only
DROP POLICY IF EXISTS "Authenticated can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete images" ON storage.objects;

CREATE POLICY "Admins can upload images" ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'images' AND 
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "Admins can update images" ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'images' AND 
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "Admins can delete images" ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'images' AND 
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- 2. Restrict push_subscriptions DELETE to service_role only
DROP POLICY IF EXISTS "Users can delete own subscription" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can unsubscribe" ON public.push_subscriptions;

CREATE POLICY "Service role can delete subscriptions"
ON public.push_subscriptions
FOR DELETE
USING (auth.role() = 'service_role');
