import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é **Ella Ribeiro**, assistente IA do painel da Juju Senna. Você tem acesso total ao banco de dados e pode gerenciar produtos, links e anúncios.

## Personalidade
- Amigável, profissional e proativa
- Sempre responda em **português brasileiro**
- Use emojis com moderação para ser expressiva
- Confirme ações executadas com detalhes específicos (nome, preço, etc.)
- Quando listar dados, formate de forma organizada e legível

## Contexto Atual do App
Você receberá os dados atuais do banco (produtos, links, anúncios) junto com cada mensagem. Use esses dados para:
- Encontrar itens pelo **nome** (busca parcial, case-insensitive)
- Sugerir ações baseadas no estado atual
- Informar quantidades e status
- Identificar IDs automaticamente sem pedir ao admin

## Regras de Execução
1. Quando o admin pedir algo sobre um item específico, **procure pelo nome** nos dados contextuais e use o ID encontrado
2. Se houver ambiguidade (ex: múltiplos resultados), liste as opções e peça para escolher
3. Se faltar campo obrigatório, peça de forma natural antes de executar
4. Para listagens, use list_data mas também analise os dados contextuais
5. Pode executar **múltiplas ações** em sequência se solicitado
6. Se o admin pedir algo genérico como "ative todos os produtos inativos", itere sobre os dados e execute

## Campos Obrigatórios
- **Produto**: name, description, full_description, price, category
- **Link**: title, url  
- **Anúncio**: title, link_url, advertiser_name

## Capacidades Extras
- Pode gerar descrições criativas para produtos
- Pode sugerir preços baseados na categoria
- Pode analisar dados e dar insights (ex: "você tem 3 produtos inativos")
- Pode buscar por categoria, status, preço, tags, etc.`;

const tools = [
  {
    type: "function",
    function: {
      name: "add_product",
      description: "Adiciona um novo produto à loja. Use quando o admin quiser criar/adicionar um produto novo.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nome do produto" },
          description: { type: "string", description: "Descrição curta (1-2 frases)" },
          full_description: { type: "string", description: "Descrição completa e detalhada do produto" },
          price: { type: "number", description: "Preço em reais (ex: 29.90)" },
          original_price: { type: "number", description: "Preço original antes do desconto (opcional)" },
          category: { type: "string", description: "Categoria do produto (ex: Produtividade, Design, IA, Social Media)" },
          tags: { type: "array", items: { type: "string" }, description: "Tags para busca e filtro" },
          featured: { type: "boolean", description: "Se deve ser exibido como destaque" },
          active: { type: "boolean", description: "Se está visível na loja (default: true)" },
          image_url: { type: "string", description: "URL da imagem do produto" },
        },
        required: ["name", "description", "full_description", "price", "category"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_product",
      description: "Atualiza campos de um produto existente. Busque o ID nos dados contextuais pelo nome do produto.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "UUID do produto (obtenha dos dados contextuais)" },
          name: { type: "string" },
          description: { type: "string" },
          full_description: { type: "string" },
          price: { type: "number" },
          original_price: { type: "number" },
          category: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          featured: { type: "boolean" },
          active: { type: "boolean" },
          image_url: { type: "string" },
        },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_product",
      description: "Remove permanentemente um produto. Busque o ID nos dados contextuais pelo nome.",
      parameters: {
        type: "object",
        properties: { id: { type: "string", description: "UUID do produto" } },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_link",
      description: "Adiciona um novo link ao perfil. Ícones suportados: Instagram, Youtube, Github, Twitter, Linkedin, Globe, Link, Music, Video, ShoppingBag, BookOpen, Gamepad2, MessageCircle, Mail",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Título exibido do link" },
          url: { type: "string", description: "URL completa (com https://)" },
          icon: { type: "string", description: "Nome do ícone Lucide (ex: Instagram, Youtube)" },
          category: { type: "string", enum: ["social", "content", "store"], description: "Categoria do link" },
          sort_order: { type: "number", description: "Posição na lista (menor = primeiro)" },
          active: { type: "boolean", description: "Se está visível (default: true)" },
        },
        required: ["title", "url"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_link",
      description: "Atualiza um link existente. Busque o ID nos dados contextuais pelo título.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "UUID do link" },
          title: { type: "string" },
          url: { type: "string" },
          icon: { type: "string" },
          category: { type: "string", enum: ["social", "content", "store"] },
          sort_order: { type: "number" },
          active: { type: "boolean" },
        },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_link",
      description: "Remove permanentemente um link. Busque o ID nos dados contextuais.",
      parameters: {
        type: "object",
        properties: { id: { type: "string", description: "UUID do link" } },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_ad",
      description: "Cria um novo anúncio/banner patrocinado.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Título do anúncio" },
          description: { type: "string", description: "Texto descritivo" },
          image_url: { type: "string", description: "URL da imagem do banner" },
          link_url: { type: "string", description: "URL de destino ao clicar" },
          advertiser_name: { type: "string", description: "Nome do anunciante/empresa" },
          active: { type: "boolean" },
          sort_order: { type: "number" },
          expires_at: { type: "string", description: "Data de expiração ISO 8601 (opcional)" },
        },
        required: ["title", "link_url", "advertiser_name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_ad",
      description: "Atualiza um anúncio existente. Busque o ID nos dados contextuais.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "UUID do anúncio" },
          title: { type: "string" },
          description: { type: "string" },
          image_url: { type: "string" },
          link_url: { type: "string" },
          advertiser_name: { type: "string" },
          active: { type: "boolean" },
          sort_order: { type: "number" },
          expires_at: { type: "string" },
        },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_ad",
      description: "Remove permanentemente um anúncio.",
      parameters: {
        type: "object",
        properties: { id: { type: "string", description: "UUID do anúncio" } },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_data",
      description: "Lista dados atualizados do banco. Use para obter informações em tempo real sobre produtos, links ou anúncios.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["products", "links", "ads", "all"], description: "Tipo de dados a listar. Use 'all' para uma visão geral completa." },
        },
        required: ["type"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_data",
      description: "Busca itens por nome/título no banco. Use para encontrar itens específicos antes de atualizar ou deletar.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Termo de busca (nome parcial)" },
          type: { type: "string", enum: ["products", "links", "ads", "all"], description: "Onde buscar" },
        },
        required: ["query", "type"],
        additionalProperties: false,
      },
    },
  },
];

// Optimized context: only essential fields
async function fetchContext(supabase: any): Promise<string> {
  try {
    const [productsRes, linksRes, adsRes] = await Promise.all([
      supabase.from("products").select("id,name,price,active,featured,category").order("sort_order"),
      supabase.from("links").select("id,title,url,icon,category,active").order("sort_order"),
      supabase.from("ads").select("id,title,advertiser_name,active,expires_at").order("sort_order"),
    ]);

    const products = productsRes.data || [];
    const links = linksRes.data || [];
    const ads = adsRes.data || [];

    const summary = [
      `## Dados Atuais do App`,
      `### Produtos (${products.length} total, ${products.filter((p: any) => p.active).length} ativos)`,
      ...products.map((p: any) => `- **${p.name}** [ID: ${p.id}] | R$${p.price} | ${p.category} | ${p.active ? '✅' : '❌'} ${p.featured ? '⭐' : ''}`),
      `### Links (${links.length} total, ${links.filter((l: any) => l.active).length} ativos)`,
      ...links.map((l: any) => `- **${l.title}** [ID: ${l.id}] | ${l.url} | ${l.icon} | ${l.active ? '✅' : '❌'}`),
      `### Anúncios (${ads.length} total, ${ads.filter((a: any) => a.active).length} ativos)`,
      ...ads.map((a: any) => `- **${a.title}** [ID: ${a.id}] | ${a.advertiser_name} | ${a.active ? '✅' : '❌'}${a.expires_at ? ` | Exp: ${a.expires_at}` : ''}`),
    ].join('\n');

    return summary;
  } catch (e) {
    console.error("Error fetching context:", e);
    return "Erro ao carregar dados do contexto.";
  }
}

async function executeTool(supabase: any, name: string, args: any): Promise<string> {
  try {
    switch (name) {
      case "add_product": {
        const { data, error } = await supabase
          .from("products")
          .insert({
            name: args.name,
            description: args.description,
            full_description: args.full_description,
            price: args.price,
            original_price: args.original_price || null,
            category: args.category || "Geral",
            tags: args.tags || [],
            featured: args.featured ?? false,
            active: args.active ?? true,
            image_url: args.image_url || null,
          })
          .select()
          .single();
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, message: `Produto "${data.name}" criado com sucesso! ID: ${data.id}, Preço: R$${data.price}` });
      }
      case "update_product": {
        const { id, ...updates } = args;
        const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single();
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, message: `Produto "${data.name}" atualizado com sucesso!`, product: { id: data.id, name: data.name, price: data.price, active: data.active } });
      }
      case "delete_product": {
        const { data: existing } = await supabase.from("products").select("name").eq("id", args.id).single();
        const { error } = await supabase.from("products").delete().eq("id", args.id);
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, message: `Produto "${existing?.name || args.id}" removido permanentemente.` });
      }
      case "add_link": {
        const { data, error } = await supabase
          .from("links")
          .insert({
            title: args.title,
            url: args.url,
            icon: args.icon || "Link",
            category: args.category || "content",
            sort_order: args.sort_order || 1,
            active: args.active ?? true,
          })
          .select()
          .single();
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, message: `Link "${data.title}" criado! URL: ${data.url}` });
      }
      case "update_link": {
        const { id, ...updates } = args;
        const { data, error } = await supabase.from("links").update(updates).eq("id", id).select().single();
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, message: `Link "${data.title}" atualizado!` });
      }
      case "delete_link": {
        const { data: existing } = await supabase.from("links").select("title").eq("id", args.id).single();
        const { error } = await supabase.from("links").delete().eq("id", args.id);
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, message: `Link "${existing?.title || args.id}" removido.` });
      }
      case "add_ad": {
        const { data, error } = await supabase
          .from("ads")
          .insert({
            title: args.title,
            description: args.description || null,
            image_url: args.image_url || null,
            link_url: args.link_url,
            advertiser_name: args.advertiser_name,
            active: args.active ?? true,
            sort_order: args.sort_order || 1,
            expires_at: args.expires_at || null,
          })
          .select()
          .single();
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, message: `Anúncio "${data.title}" do anunciante ${data.advertiser_name} criado!` });
      }
      case "update_ad": {
        const { id, ...updates } = args;
        const { data, error } = await supabase.from("ads").update(updates).eq("id", id).select().single();
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, message: `Anúncio "${data.title}" atualizado!` });
      }
      case "delete_ad": {
        const { data: existing } = await supabase.from("ads").select("title").eq("id", args.id).single();
        const { error } = await supabase.from("ads").delete().eq("id", args.id);
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, message: `Anúncio "${existing?.title || args.id}" removido.` });
      }
      case "list_data": {
        if (args.type === "all") {
          const [p, l, a] = await Promise.all([
            supabase.from("products").select("*").order("sort_order"),
            supabase.from("links").select("*").order("sort_order"),
            supabase.from("ads").select("*").order("sort_order"),
          ]);
          return JSON.stringify({
            products: { data: p.data || [], count: p.data?.length || 0 },
            links: { data: l.data || [], count: l.data?.length || 0 },
            ads: { data: a.data || [], count: a.data?.length || 0 },
          });
        }
        const table = args.type === "products" ? "products" : args.type === "links" ? "links" : "ads";
        const { data, error } = await supabase.from(table).select("*").order("sort_order");
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ data, count: data.length });
      }
      case "search_data": {
        const query = args.query.toLowerCase();
        const results: any = {};

        if (args.type === "all" || args.type === "products") {
          const { data } = await supabase.from("products").select("*").ilike("name", `%${query}%`).order("sort_order");
          results.products = data || [];
        }
        if (args.type === "all" || args.type === "links") {
          const { data } = await supabase.from("links").select("*").ilike("title", `%${query}%`).order("sort_order");
          results.links = data || [];
        }
        if (args.type === "all" || args.type === "ads") {
          const { data } = await supabase.from("ads").select("*").ilike("title", `%${query}%`).order("sort_order");
          results.ads = data || [];
        }

        const totalFound = Object.values(results).reduce((acc: number, arr: any) => acc + (arr?.length || 0), 0);
        return JSON.stringify({ results, total_found: totalFound, query: args.query });
      }
      default:
        return JSON.stringify({ error: `Tool ${name} não encontrada` });
    }
  } catch (e) {
    return JSON.stringify({ error: e.message });
  }
}

// SSE helper to write events to a stream controller
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

    // Fetch context
    const contextData = await fetchContext(supabase);
    const systemWithContext = `${SYSTEM_PROMPT}\n\n${contextData}`;

    const conversationMessages: any[] = [
      { role: "system", content: systemWithContext },
      ...messages,
    ];
    const allExecutedActions: string[] = [];
    const MAX_ITERATIONS = 3;

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (let i = 0; i < MAX_ITERATIONS; i++) {
            // Check if this is potentially the last iteration - try streaming
            const isLastChance = i === MAX_ITERATIONS - 1;
            
            // First do a non-streaming call to check for tool_calls
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
              if (status === 429) errorMsg = "Rate limit excedido. Tente novamente em alguns segundos.";
              else if (status === 402) errorMsg = "Créditos insuficientes para IA.";
              else errorMsg = `Erro na IA: ${t}`;
              sseEvent(controller, "error", { error: errorMsg });
              break;
            }

            const aiData = await aiResponse.json();
            const choice = aiData.choices?.[0];
            if (!choice) break;

            const assistantMessage = choice.message;

            // No tool calls = final text response -> stream it as tokens
            if (!assistantMessage?.tool_calls || assistantMessage.tool_calls.length === 0) {
              const finalText = assistantMessage?.content || "Pronto! Algo mais?";
              // Send the text in chunks to simulate streaming effect
              const words = finalText.split(/(\s+)/);
              let buffer = "";
              for (let w = 0; w < words.length; w++) {
                buffer += words[w];
                // Send every few words for smooth streaming
                if (w % 3 === 2 || w === words.length - 1) {
                  sseEvent(controller, "token", { content: buffer });
                  buffer = "";
                }
              }
              sseEvent(controller, "done", { actions: allExecutedActions });
              break;
            }

            // Has tool calls - execute them
            conversationMessages.push(assistantMessage);

            // Execute tool calls in parallel
            const toolPromises = assistantMessage.tool_calls.map(async (tc: any) => {
              const args = typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments;
              console.log(`Executing tool: ${tc.function.name}`, args);
              
              // Send status event to frontend
              sseEvent(controller, "status", { tool: tc.function.name, args });
              
              const result = await executeTool(supabase, tc.function.name, args);
              console.log(`Tool result: ${result}`);
              
              return { id: tc.id, name: tc.function.name, result };
            });

            const toolResults = await Promise.all(toolPromises);

            for (const tr of toolResults) {
              conversationMessages.push({
                tool_call_id: tr.id,
                role: "tool",
                content: tr.result,
              });
              allExecutedActions.push(tr.name);
            }

            // If last iteration, send fallback
            if (isLastChance) {
              sseEvent(controller, "token", { content: "Ações executadas com sucesso! Algo mais que posso ajudar?" });
              sseEvent(controller, "done", { actions: allExecutedActions });
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
    console.error("ella-chat error:", e);
    return new Response(JSON.stringify({ error: e.message || "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
