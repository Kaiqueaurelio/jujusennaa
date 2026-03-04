import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é **Ella Ribeiro**, assistente virtual da loja DECODE. Você ajuda **clientes** a escolherem produtos, tira dúvidas e faz uma triagem antes de encaminhá-los ao WhatsApp.

## Personalidade
- Simpática, acolhedora e consultiva (como uma vendedora especialista)
- Sempre responda em **português brasileiro**
- Use emojis com moderação
- Seja proativa em sugerir produtos baseado nas necessidades do cliente

## Seu Papel
1. **Entender a necessidade** — Pergunte o que o cliente busca, qual problema quer resolver
2. **Recomendar produtos** — Use os dados dos produtos para sugerir os mais adequados, mostrando benefícios
3. **Qualificar o lead** — Colete informações úteis: nome, o que precisa, para quando
4. **Encaminhar ao WhatsApp** — Quando o cliente estiver decidido, use a tool send_to_whatsapp para gerar o link

## Regras
- NUNCA execute operações de escrita (criar, editar, deletar produtos/links/anúncios)
- Você só tem acesso de LEITURA aos produtos
- Ao recomendar um produto, destaque: nome, preço, benefícios principais e se tem desconto
- Se o cliente perguntar algo que não sabe, diga que vai encaminhá-lo para o atendimento humano via WhatsApp
- Não invente informações sobre produtos que não estão no catálogo
- Se o cliente já sabe o que quer, vá direto ao ponto sem ficar enrolando

## Formato de Recomendação
Quando recomendar produtos, use este formato:
🏷️ **Nome do Produto**
💰 Preço: R$ XX,XX (de ~R$ YY,YY~ se tiver desconto)
✅ Benefícios: [lista curta]
`;

const tools = [
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Busca produtos no catálogo por nome ou categoria. Use para encontrar produtos relevantes para o cliente.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Termo de busca (nome parcial ou categoria)" },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_products",
      description: "Lista todos os produtos disponíveis na loja, opcionalmente filtrados por categoria.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "Filtrar por categoria (opcional)" },
          featured_only: { type: "boolean", description: "Mostrar apenas destaques" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_to_whatsapp",
      description: "Gera um link de WhatsApp com mensagem pré-preenchida para o cliente ser atendido. Use quando o cliente estiver pronto para comprar ou precisar de atendimento humano.",
      parameters: {
        type: "object",
        properties: {
          customer_name: { type: "string", description: "Nome do cliente (se coletado)" },
          product_name: { type: "string", description: "Nome do produto de interesse" },
          product_price: { type: "number", description: "Preço do produto" },
          notes: { type: "string", description: "Observações adicionais sobre o que o cliente precisa" },
        },
        required: ["product_name"],
        additionalProperties: false,
      },
    },
  },
];

async function fetchProductContext(supabase: any): Promise<string> {
  try {
    const { data: products } = await supabase
      .from("products")
      .select("id,name,description,price,original_price,category,tags,featured,active")
      .eq("active", true)
      .order("sort_order");

    const { data: profile } = await supabase
      .from("profiles")
      .select("whatsapp")
      .limit(1)
      .single();

    const items = (products || []).map((p: any) => {
      const discount = p.original_price ? Math.round((1 - p.price / p.original_price) * 100) : 0;
      return `- **${p.name}** | R$${p.price}${discount > 0 ? ` (${discount}% OFF, era R$${p.original_price})` : ''} | ${p.category} | ${p.description} | Tags: ${(p.tags || []).join(', ')}${p.featured ? ' | ⭐ Destaque' : ''}`;
    }).join('\n');

    return `## Catálogo Atual (${(products || []).length} produtos ativos)\n${items}\n\n## WhatsApp: ${profile?.whatsapp || '5511939222885'}`;
  } catch (e) {
    console.error("Error fetching context:", e);
    return "Erro ao carregar catálogo.";
  }
}

async function executeTool(supabase: any, name: string, args: any, whatsapp: string): Promise<string> {
  try {
    switch (name) {
      case "search_products": {
        const { data } = await supabase
          .from("products")
          .select("*")
          .eq("active", true)
          .ilike("name", `%${args.query}%`)
          .order("sort_order");
        
        // Also search by category
        const { data: catData } = await supabase
          .from("products")
          .select("*")
          .eq("active", true)
          .ilike("category", `%${args.query}%`)
          .order("sort_order");

        const allResults = [...(data || [])];
        const existingIds = new Set(allResults.map((p: any) => p.id));
        for (const p of (catData || [])) {
          if (!existingIds.has(p.id)) allResults.push(p);
        }

        return JSON.stringify({ products: allResults, count: allResults.length });
      }
      case "list_products": {
        let query = supabase.from("products").select("*").eq("active", true);
        if (args.category) query = query.ilike("category", `%${args.category}%`);
        if (args.featured_only) query = query.eq("featured", true);
        const { data } = await query.order("sort_order");
        return JSON.stringify({ products: data || [], count: (data || []).length });
      }
      case "send_to_whatsapp": {
        let message = `Olá! Vim pelo atendimento com a Ella 🤖\n\n`;
        if (args.customer_name) message += `👤 Meu nome: ${args.customer_name}\n`;
        message += `📦 Produto de interesse: ${args.product_name}\n`;
        if (args.product_price) message += `💰 Valor: R$ ${args.product_price.toFixed(2).replace('.', ',')}\n`;
        if (args.notes) message += `📝 Observação: ${args.notes}\n`;
        message += `\nGostaria de finalizar minha compra!`;
        
        const link = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
        return JSON.stringify({ 
          success: true, 
          whatsapp_link: link,
          message: `Link gerado! Direcione o cliente para o WhatsApp.`
        });
      }
      default:
        return JSON.stringify({ error: `Tool ${name} não encontrada` });
    }
  } catch (e) {
    return JSON.stringify({ error: e.message });
  }
}

function sseEvent(controller: ReadableStreamDefaultController, event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(payload));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const contextData = await fetchProductContext(supabase);
    // Extract whatsapp from context
    const whatsappMatch = contextData.match(/WhatsApp: (\d+)/);
    const whatsapp = whatsappMatch?.[1] || '5511939222885';

    const systemWithContext = `${SYSTEM_PROMPT}\n\n${contextData}`;

    const conversationMessages: any[] = [
      { role: "system", content: systemWithContext },
      ...messages,
    ];
    const MAX_ITERATIONS = 3;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (let i = 0; i < MAX_ITERATIONS; i++) {
            const isLastChance = i === MAX_ITERATIONS - 1;

            const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
                messages: conversationMessages,
                tools,
                tool_choice: "auto",
              }),
            });

            if (!aiResponse.ok) {
              const status = aiResponse.status;
              const t = await aiResponse.text();
              let errorMsg = "Erro na IA";
              if (status === 429) errorMsg = "Estou com muitas conversas agora. Tente novamente em alguns segundos! 😊";
              else if (status === 402) errorMsg = "Serviço temporariamente indisponível.";
              else errorMsg = `Erro: ${t}`;
              sseEvent(controller, "error", { error: errorMsg });
              break;
            }

            const aiData = await aiResponse.json();
            const choice = aiData.choices?.[0];
            if (!choice) break;

            const assistantMessage = choice.message;

            if (!assistantMessage?.tool_calls || assistantMessage.tool_calls.length === 0) {
              const finalText = assistantMessage?.content || "Como posso te ajudar? 😊";
              const words = finalText.split(/(\s+)/);
              let buffer = "";
              for (let w = 0; w < words.length; w++) {
                buffer += words[w];
                if (w % 3 === 2 || w === words.length - 1) {
                  sseEvent(controller, "token", { content: buffer });
                  buffer = "";
                }
              }
              sseEvent(controller, "done", { actions: [] });
              break;
            }

            conversationMessages.push(assistantMessage);

            const toolPromises = assistantMessage.tool_calls.map(async (tc: any) => {
              const args = typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments;
              sseEvent(controller, "status", { tool: tc.function.name });
              const result = await executeTool(supabase, tc.function.name, args, whatsapp);
              
              // If it's a WhatsApp link, send it as a special event
              if (tc.function.name === "send_to_whatsapp") {
                try {
                  const parsed = JSON.parse(result);
                  if (parsed.whatsapp_link) {
                    sseEvent(controller, "whatsapp_link", { url: parsed.whatsapp_link });
                  }
                } catch {}
              }
              
              return { id: tc.id, name: tc.function.name, result };
            });

            const toolResults = await Promise.all(toolPromises);

            for (const tr of toolResults) {
              conversationMessages.push({
                tool_call_id: tr.id,
                role: "tool",
                content: tr.result,
              });
            }

            if (isLastChance) {
              sseEvent(controller, "token", { content: "Posso te ajudar com mais alguma coisa? 😊" });
              sseEvent(controller, "done", { actions: [] });
            }
          }
        } catch (e) {
          console.error("SSE stream error:", e);
          sseEvent(controller, "error", { error: e.message || "Erro interno" });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (e) {
    console.error("ella-public-chat error:", e);
    return new Response(JSON.stringify({ error: e.message || "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
