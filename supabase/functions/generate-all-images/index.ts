import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function sanitize(str: string, maxLen: number): string {
  return str.replace(/[^\p{L}\p{N}\s\-.,!?()]/gu, '').trim().slice(0, maxLen);
}

function sceneForProduct(name: string, category: string): string {
  const n = name.toLowerCase();
  const c = category.toLowerCase();

  // Gráfica & Impressos — real print shop photography
  if (n.includes('laminaç') || n.includes('plastific')) return 'close-up macro photograph of a professional lamination machine sealing a glossy document, hot rollers, steam, printed papers stacked beside, print shop environment';
  if (n.includes('adesivo')) return 'stack of die-cut vinyl stickers on a workbench, colorful custom logo stickers peeled halfway, cutting plotter blurred in background, studio product photography';
  if (n.includes('tiragem') || n.includes('cartaz')) return 'industrial offset printing press mid-run, freshly printed colorful posters stacked, ink rollers, print shop factory lighting';
  if (n.includes('panfleto') || n.includes('flyer')) return 'fan of glossy colorful printed flyers spread on a wooden table, promotional design, sharp focus, professional product photography';
  if (n.includes('convite')) return 'elegant printed wedding invitation with gold foil embossing, envelope, ribbon, on marble surface, luxury stationery photography';
  if (n.includes('copo térmico') || n.includes('copo termico')) return 'stainless steel insulated tumbler with custom laser-engraved logo, condensation droplets, studio product shot on gradient background';
  if (n.includes('caneca')) return 'ceramic white mug with custom colorful printed design, steam rising from coffee, wooden table, morning light, product photography';
  if (n.includes('camiseta')) return 'folded custom-printed cotton t-shirt with vibrant DTG print, hanging tag, apparel product photography, soft studio light';

  // Informática — real tech scenes
  if (n.includes('formataç') && (n.includes('pc') || n.includes('notebook'))) return 'open laptop showing Windows installation progress screen, screwdriver and RAM stick beside, tech repair workbench, dramatic lighting';
  if (n.includes('formataç') && n.includes('ios')) return 'iPhone on desk showing Apple logo boot screen, lightning cable connected to MacBook, clean minimal tech setup';
  if (n.includes('formataç') && n.includes('android')) return 'Android smartphone displaying factory reset progress, USB cable, tech repair environment';
  if (n.includes('office')) return 'laptop screen showing Microsoft Office 365 suite icons, Word Excel PowerPoint, modern desk workspace';
  if (n.includes('site')) return 'code editor on ultrawide monitor showing React website code, live preview browser, developer workspace, neon ambient light';
  if (n.includes('app')) return 'smartphone mockup floating with mobile app UI screens, gradient background, product design showcase';

  // Mídias Sociais
  if (n.includes('social media avulso') || n.includes('design social')) return 'Instagram post design mockup on smartphone screen, colorful branded feed, designer workspace with tablet and stylus';
  if (n.includes('social media mensal')) return 'content calendar spread on desk with multiple social media post designs, analytics graphs, smartphone showing Instagram grid';
  if (n.includes('planejamento social')) return 'strategy notebook with social media planning notes, colorful sticky notes, laptop showing analytics dashboard';
  if (n.includes('gestão de mídias') || n.includes('gestao de midias')) return 'multiple screens showing social media dashboards, Instagram Facebook TikTok analytics, agency office ambience';
  if (n.includes('identidade visual')) return 'brand identity mockup spread: logo variations, color palette swatches, business cards, letterhead on wooden desk';
  if (n.includes('cartões de visita') || n.includes('cartoes de visita')) return 'stack of premium matte business cards with gold foil accent, fanned out on dark surface, luxury stationery photography';

  // Edição
  if (n.includes('edição de vídeo') || n.includes('edicao de video')) return 'video editing timeline in DaVinci Resolve on dual monitors, color grading scopes, cinematic dark studio';
  if (n.includes('edição de áudio') || n.includes('edicao de audio')) return 'audio waveform in DAW on monitor, studio condenser microphone, headphones, warm studio lighting';
  if (n.includes('animação de fotos') || n.includes('animacao de fotos')) return 'old sepia family photograph being brought to life with subtle motion, vintage frame, nostalgic warm lighting';
  if (n.includes('remoção de fundo') || n.includes('remocao de fundo')) return 'photo editing software showing subject cutout from background with transparency checkerboard, professional retouching';
  if (n.includes('remoção de objeto') || n.includes('remocao de objeto')) return 'before and after photo editing screen showing object removal, healing brush tool, retouching software';
  if (n.includes('tratamento de pele')) return 'portrait retouching in Photoshop showing before/after skin smoothing, frequency separation, beauty retouch workflow';
  if (n.includes('restauraç')) return 'damaged vintage photograph being digitally restored, torn edges being repaired, side-by-side before and after';
  if (n.includes('cobertura de evento')) return 'professional photographer with DSLR camera at elegant event, bokeh lights, crowd, cinematic event coverage';

  // Templates Notion
  if (n.includes('planner 2025')) return 'Notion dashboard on laptop showing 2025 planner template, calendar view, elegant minimal design, coffee mug beside';
  if (n.includes('planner book')) return 'Notion template screenshot on tablet showing book tracker with reading list, minimalist beige aesthetic';
  if (n.includes('planner de estudo')) return 'Notion study planner on iPad, subject tracker, pomodoro timer, textbooks, cozy study desk';
  if (n.includes('hackprompt') || n.includes('chatgpt')) return 'laptop showing ChatGPT interface with advanced prompts, dark neon coding aesthetic, AI workspace';
  if (n.includes('game dash')) return 'Notion gaming dashboard on ultrawide monitor, game library tracker, controller and RGB keyboard, gamer setup';
  if (n.includes('cards advanced')) return 'Notion database with rich card gallery view, colorful cover images, modern productivity workspace';
  if (n.includes('hábito') || n.includes('habito')) return 'Notion habit tracker template on tablet, checkbox grid, morning routine, plants and coffee, wellness aesthetic';
  if (n.includes('meta')) return 'Notion goal-tracking dashboard on laptop, progress bars, vision board, motivational workspace';

  // Acadêmicos
  if (n.includes('trabalhos acadêmico') || n.includes('trabalhos academico')) return 'stack of bound academic thesis papers on university desk, laptop with document open, glasses and coffee, scholarly ambience';
  if (n.includes('banners acadêmico') || n.includes('banners academico')) return 'large printed academic research poster on tripod stand at scientific conference, charts and diagrams visible';
  if (n.includes('caderno de estudo')) return 'open handwritten study notebook with colorful highlighted notes, mind maps, sticky tabs, student desk';
  if (n.includes('decode analytics academy')) return 'online course platform on laptop showing data analytics dashboard lessons, dark UI with red neon accents, professional edtech';

  // Fallback: category-based realistic scene
  if (c.includes('gráfica') || c.includes('grafica')) return `real print shop photograph showing ${name}, industrial printing environment, product photography`;
  return `hyper-realistic professional photograph representing the service "${name}" in the ${category} category, contextual real-world scene, cinematic lighting`;
}

function buildPrompt(productName: string, productCategory: string): string {
  const scene = sceneForProduct(productName, productCategory);
  return `Ultra photorealistic 16:9 product thumbnail. Scene: ${scene}.

Requirements:
- Shot on Sony A7 IV, 50mm f/1.4, shallow depth of field, natural cinematic lighting
- Looks like a real professional photograph, NOT AI art, NOT 3D render, NOT illustration
- Subtle deep dark ambience with red/magenta neon rim highlights (Juju Senna brand)
- Sharp focus on the subject, tack-sharp details, realistic textures and materials
- NO text overlays, NO watermarks, NO logos, NO typography, NO letters, NO words in the image
- Editorial commercial photography aesthetic, magazine quality
- Rich color grading, filmic contrast, real physical lighting
Composition: rule of thirds, professional product photography, 16:9 landscape.`;
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
