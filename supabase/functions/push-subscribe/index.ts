import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const subscription = body?.subscription;

    // Validate subscription structure
    if (!subscription || typeof subscription !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid subscription data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate endpoint is a valid HTTPS URL and within length limits
    if (!subscription.endpoint || typeof subscription.endpoint !== 'string' || subscription.endpoint.length > 500 || !isValidUrl(subscription.endpoint)) {
      return new Response(
        JSON.stringify({ error: 'Invalid endpoint: must be a valid HTTPS URL under 500 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate keys exist and are proper strings
    if (!subscription.keys || typeof subscription.keys !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Missing subscription keys' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { p256dh, auth } = subscription.keys;
    if (!p256dh || typeof p256dh !== 'string' || p256dh.length < 1 || p256dh.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Invalid p256dh key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!auth || typeof auth !== 'string' || auth.length < 1 || auth.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Invalid auth key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Rate limit: check how many subscriptions exist (prevent spam)
    const { count, error: countError } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true });

    if (!countError && count !== null && count >= 1000) {
      return new Response(
        JSON.stringify({ error: 'Subscription limit reached' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: subscription.endpoint,
        keys_p256dh: p256dh,
        keys_auth: auth,
      }, { onConflict: 'endpoint' });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to save subscription' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
