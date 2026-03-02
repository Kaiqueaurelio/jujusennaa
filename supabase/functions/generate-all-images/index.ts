import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function sanitize(str: string, maxLen: number): string {
  return str.replace(/[^\p{L}\p{N}\s\-.,!?()]/gu, '').trim().slice(0, maxLen);
}

function buildPrompt(productName: string, productCategory: string): string {
  return `Professional high-end product thumbnail for a digital product called "${productName}" in the ${productCategory} category.

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
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    const productIds: string[] | undefined = body?.productIds;
    const skipExisting: boolean = body?.skipExisting ?? true;

    // Fetch products
    let query = supabaseAdmin.from('products').select('id, name, category, image_url').eq('active', true);
    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      query = query.in('id', productIds);
    }
    const { data: products, error: fetchError } = await query.order('sort_order');

    if (fetchError || !products) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch products' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter out products that already have generated images if skipExisting
    const toGenerate = skipExisting
      ? products.filter(p => !p.image_url || !p.image_url.startsWith('http'))
      : products;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Use streaming response to report progress
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        send({ type: 'start', total: toGenerate.length });

        for (let i = 0; i < toGenerate.length; i++) {
          const product = toGenerate[i];
          const productName = sanitize(product.name, 100);
          const productCategory = sanitize(product.category || 'Digital', 50);

          send({ type: 'progress', current: i + 1, total: toGenerate.length, productName: product.name });

          try {
            const prompt = buildPrompt(productName, productCategory);

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
                send({ type: 'error', productName: product.name, error: 'Rate limit - aguardando...' });
                // Wait 30s on rate limit then retry
                await new Promise(r => setTimeout(r, 30000));
                i--; // retry this product
                continue;
              }
              send({ type: 'error', productName: product.name, error: `API error ${status}` });
              continue;
            }

            const data = await response.json();
            const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

            if (!imageUrl) {
              send({ type: 'error', productName: product.name, error: 'No image generated' });
              continue;
            }

            const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
            const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            
            const safeName = productName.replace(/[^a-zA-Z0-9\-]/g, '-').toLowerCase().slice(0, 50);
            const fileName = `products/${Date.now()}-${safeName}.png`;
            
            const { error: uploadError } = await supabaseAdmin.storage
              .from('images')
              .upload(fileName, imageBuffer, { contentType: 'image/png', upsert: true });

            if (uploadError) {
              send({ type: 'error', productName: product.name, error: `Upload failed: ${uploadError.message}` });
              continue;
            }

            const { data: publicUrl } = supabaseAdmin.storage.from('images').getPublicUrl(fileName);

            // Update product image_url in database
            const { error: updateError } = await supabaseAdmin
              .from('products')
              .update({ image_url: publicUrl.publicUrl })
              .eq('id', product.id);

            if (updateError) {
              send({ type: 'error', productName: product.name, error: `DB update failed: ${updateError.message}` });
              continue;
            }

            send({ type: 'success', productName: product.name, imageUrl: publicUrl.publicUrl });

            // Delay between generations to avoid rate limits
            if (i < toGenerate.length - 1) {
              await new Promise(r => setTimeout(r, 3000));
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            send({ type: 'error', productName: product.name, error: message });
          }
        }

        send({ type: 'done' });
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Batch generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
