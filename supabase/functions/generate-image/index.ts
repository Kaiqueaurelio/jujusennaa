import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Sanitize input: allow only alphanumeric, spaces, hyphens, accented chars
function sanitize(str: string, maxLen: number): string {
  return str.replace(/[^\p{L}\p{N}\s\-.,!?()]/gu, '').trim().slice(0, maxLen);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate: require admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAdmin.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // Check admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const rawName = body?.productName;
    const rawCategory = body?.productCategory;

    // Validate inputs
    if (!rawName || typeof rawName !== 'string' || rawName.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Product name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (rawName.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Product name must be under 100 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (rawCategory && (typeof rawCategory !== 'string' || rawCategory.length > 50)) {
      return new Response(
        JSON.stringify({ error: 'Category must be under 50 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize for prompt injection prevention
    const productName = sanitize(rawName, 100);
    const productCategory = rawCategory ? sanitize(rawCategory, 50) : 'Digital';

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `Professional high-end product thumbnail for a digital product called "${productName}" in the ${productCategory} category.

Style requirements:
- Hyper-realistic 3D render with cinematic lighting
- Deep rich dark background with subtle gradient (dark navy to black)
- Dramatic rim lighting highlighting the product edges
- Elegant floating elements like subtle particles, light rays, or abstract geometric shapes
- Premium luxury brand aesthetic similar to Apple or Netflix marketing
- Sharp focus with professional depth of field
- Color palette: deep blacks, rich crimsons, warm gold accents, neon purple/magenta glows
- Modern minimalist composition with strong visual hierarchy
- Photorealistic textures and materials
- The product name "${productName}" should be prominently displayed as elegant typography integrated into the design
- 16:9 aspect ratio, 4K quality appearance

The image should look like a premium marketing asset for a high-end digital product, NOT like AI-generated art. Focus on photorealism and professional product photography aesthetics.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Sanitize filename
    const safeName = productName.replace(/[^a-zA-Z0-9\-]/g, '-').toLowerCase().slice(0, 50);
    const fileName = `products/${Date.now()}-${safeName}.png`;
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('images')
      .upload(fileName, imageBuffer, { contentType: 'image/png', upsert: true });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: publicUrl } = supabaseAdmin.storage.from('images').getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ imageUrl: publicUrl.publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Image generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
