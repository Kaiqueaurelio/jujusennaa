import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é Ella Ribeiro, assistente virtual do painel DECODE. Você ajuda o admin a gerenciar produtos, links e anúncios. Seja amigável, objetiva e proativa. Sempre confirme as ações executadas com detalhes. Responda sempre em português brasileiro.

Quando o admin pedir para listar dados, use a tool list_data.
Quando pedir para adicionar, atualizar ou remover itens, use as tools correspondentes.
Se o admin não fornecer todos os campos obrigatórios, peça os que faltam antes de executar.

Campos obrigatórios para produto: name, description, full_description, price, category
Campos obrigatórios para link: title, url
Campos obrigatórios para anúncio: title, link_url, advertiser_name`;

const tools = [
  {
    type: "function",
    function: {
      name: "add_product",
      description: "Adiciona um novo produto à loja",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nome do produto" },
          description: { type: "string", description: "Descrição curta" },
          full_description: { type: "string", description: "Descrição completa" },
          price: { type: "number", description: "Preço em reais" },
          original_price: { type: "number", description: "Preço original (opcional)" },
          category: { type: "string", description: "Categoria do produto" },
          tags: { type: "array", items: { type: "string" }, description: "Tags" },
          featured: { type: "boolean", description: "Se é destaque" },
          active: { type: "boolean", description: "Se está ativo" },
          image_url: { type: "string", description: "URL da imagem" },
        },
        required: ["name", "description", "full_description", "price", "category"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_product",
      description: "Atualiza um produto existente pelo ID",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID do produto" },
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
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_product",
      description: "Remove um produto pelo ID",
      parameters: {
        type: "object",
        properties: { id: { type: "string", description: "ID do produto" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_link",
      description: "Adiciona um novo link",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Título do link" },
          url: { type: "string", description: "URL do link" },
          icon: { type: "string", description: "Nome do ícone (ex: Instagram, Youtube, Github)" },
          category: { type: "string", enum: ["social", "content", "store"], description: "Categoria" },
          sort_order: { type: "number", description: "Ordem de exibição" },
          active: { type: "boolean" },
        },
        required: ["title", "url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_link",
      description: "Atualiza um link existente pelo ID",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID do link" },
          title: { type: "string" },
          url: { type: "string" },
          icon: { type: "string" },
          category: { type: "string", enum: ["social", "content", "store"] },
          sort_order: { type: "number" },
          active: { type: "boolean" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_link",
      description: "Remove um link pelo ID",
      parameters: {
        type: "object",
        properties: { id: { type: "string", description: "ID do link" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_ad",
      description: "Cria um novo anúncio",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Título do anúncio" },
          description: { type: "string" },
          image_url: { type: "string" },
          link_url: { type: "string", description: "URL de destino" },
          advertiser_name: { type: "string", description: "Nome do anunciante" },
          active: { type: "boolean" },
          sort_order: { type: "number" },
        },
        required: ["title", "link_url", "advertiser_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_ad",
      description: "Atualiza um anúncio existente pelo ID",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID do anúncio" },
          title: { type: "string" },
          description: { type: "string" },
          image_url: { type: "string" },
          link_url: { type: "string" },
          advertiser_name: { type: "string" },
          active: { type: "boolean" },
          sort_order: { type: "number" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_ad",
      description: "Remove um anúncio pelo ID",
      parameters: {
        type: "object",
        properties: { id: { type: "string", description: "ID do anúncio" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_data",
      description: "Lista dados do sistema (produtos, links ou anúncios)",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["products", "links", "ads"], description: "Tipo de dados" },
        },
        required: ["type"],
      },
    },
  },
];

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
        return JSON.stringify({ success: true, product: data });
      }
      case "update_product": {
        const { id, ...updates } = args;
        const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single();
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, product: data });
      }
      case "delete_product": {
        const { error } = await supabase.from("products").delete().eq("id", args.id);
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, message: "Produto removido" });
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
        return JSON.stringify({ success: true, link: data });
      }
      case "update_link": {
        const { id, ...updates } = args;
        if (updates.sort_order !== undefined) {
          // map to db column
        }
        const { data, error } = await supabase.from("links").update(updates).eq("id", id).select().single();
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, link: data });
      }
      case "delete_link": {
        const { error } = await supabase.from("links").delete().eq("id", args.id);
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, message: "Link removido" });
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
          })
          .select()
          .single();
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, ad: data });
      }
      case "update_ad": {
        const { id, ...updates } = args;
        const { data, error } = await supabase.from("ads").update(updates).eq("id", id).select().single();
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, ad: data });
      }
      case "delete_ad": {
        const { error } = await supabase.from("ads").delete().eq("id", args.id);
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, message: "Anúncio removido" });
      }
      case "list_data": {
        const table = args.type === "products" ? "products" : args.type === "links" ? "links" : "ads";
        const { data, error } = await supabase.from(table).select("*").order("sort_order", { ascending: true });
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ data, count: data.length });
      }
      default:
        return JSON.stringify({ error: `Tool ${name} não encontrada` });
    }
  } catch (e) {
    return JSON.stringify({ error: e.message });
  }
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

    // First call with tools
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        tools,
        tool_choice: "auto",
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResponse.text();
      return new Response(JSON.stringify({ error: "Erro na IA: " + t }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const choice = aiData.choices?.[0];

    if (!choice) {
      return new Response(JSON.stringify({ error: "Sem resposta da IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If no tool calls, return the text response
    if (!choice.message?.tool_calls || choice.message.tool_calls.length === 0) {
      return new Response(
        JSON.stringify({
          reply: choice.message?.content || "Não entendi. Pode reformular?",
          actions: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Execute tool calls
    const toolCalls = choice.message.tool_calls;
    const toolResults: any[] = [];
    const executedActions: string[] = [];

    for (const tc of toolCalls) {
      const args = typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments;
      const result = await executeTool(supabase, tc.function.name, args);
      toolResults.push({
        tool_call_id: tc.id,
        role: "tool",
        content: result,
      });
      executedActions.push(tc.function.name);
    }

    // Second call to get a friendly response after tool execution
    const followUp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
          choice.message,
          ...toolResults,
        ],
      }),
    });

    let replyText = "Ação executada com sucesso!";
    if (followUp.ok) {
      const followUpData = await followUp.json();
      replyText = followUpData.choices?.[0]?.message?.content || replyText;
    }

    return new Response(
      JSON.stringify({
        reply: replyText,
        actions: executedActions,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
