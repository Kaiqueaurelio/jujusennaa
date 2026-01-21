import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, productCategory } = await req.json();

    if (!productName) {
      return new Response(
        JSON.stringify({ error: 'Product name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `Professional high-end product photography for a digital product called "${productName}" in the ${productCategory || 'Digital'} category. 

Style requirements:
- Hyper-realistic 3D render with cinematic lighting
- Deep rich dark background with subtle gradient (dark navy to black)
- Dramatic rim lighting highlighting the product edges
- Elegant floating elements like subtle particles, light rays, or abstract geometric shapes
- Premium luxury brand aesthetic similar to Apple or Netflix marketing
- Sharp focus with professional depth of field
- Color palette: deep blacks, rich crimsons, warm gold accents
- Modern minimalist composition with strong visual hierarchy
- Photorealistic textures and materials
- 16:9 aspect ratio, 4K quality appearance

The image should look like a premium marketing asset for a high-end digital product, NOT like AI-generated art. Focus on photorealism and professional product photography aesthetics.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const fileName = `products/${Date.now()}-${productName.replace(/\s+/g, '-').toLowerCase()}.png`;
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, imageBuffer, { contentType: 'image/png', upsert: true });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: publicUrl } = supabase.storage.from('images').getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ imageUrl: publicUrl.publicUrl }),
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
