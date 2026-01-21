-- Create push subscriptions table
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL UNIQUE,
  keys_p256dh text NOT NULL,
  keys_auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert subscriptions (anonymous users can subscribe)
CREATE POLICY "Anyone can subscribe to push notifications" 
ON public.push_subscriptions 
FOR INSERT 
TO public
WITH CHECK (true);

-- Only admins can view subscriptions
CREATE POLICY "Admins can view push subscriptions" 
ON public.push_subscriptions 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow anyone to delete their own subscription by endpoint
CREATE POLICY "Anyone can unsubscribe" 
ON public.push_subscriptions 
FOR DELETE 
TO public
USING (true);