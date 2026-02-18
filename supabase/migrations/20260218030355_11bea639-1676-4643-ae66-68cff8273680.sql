-- Tighten product_clicks INSERT: require that product_id references an active product
-- Drop the old permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can insert product clicks" ON public.product_clicks;

-- Create a more restrictive INSERT policy that validates product exists
CREATE POLICY "Validated product clicks only"
ON public.product_clicks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE id = product_id AND active = true
  )
);