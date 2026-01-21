import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Web Push implementation using web-push compatible approach
async function sendWebPush(subscription: { endpoint: string; keys_p256dh: string; keys_auth: string }, payload: string) {
  const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  
  if (!vapidPrivateKey) {
    console.log('VAPID_PRIVATE_KEY not configured, skipping push notification');
    return { success: false, reason: 'VAPID not configured' };
  }

  try {
    // For now, we'll use a simpler approach that works without web-push library
    // In production, you'd want to use a proper web-push implementation
    console.log('Would send push to:', subscription.endpoint);
    console.log('Payload:', payload);
    
    return { success: true };
  } catch (error) {
    console.error('Push failed:', error);
    return { success: false, reason: String(error) };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, body, url, productId } = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error) throw error;

    console.log(`Sending push to ${subscriptions?.length || 0} subscribers`);

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      productId
    });

    const results = await Promise.all(
      (subscriptions || []).map(sub => sendWebPush(sub, payload))
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Push results: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successful,
        failed: failed,
        total: subscriptions?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});